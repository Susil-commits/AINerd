"""
FastAPI Backend — AI Socratic Tutor
All routes, streaming SSE, ElevenLabs TTS proxy, session management.
"""
import os
import sys
import uuid
import json
import time
import asyncio
import warnings
import httpx
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Suppress harmless LangGraph/LangChain internal serializer deprecation notice on startup
warnings.filterwarnings("ignore", message=".*allowed_objects.*")
_orig_showwarning = warnings.showwarning
def _suppress_langgraph_deprecation(message, category, filename, lineno, file=None, line=None):
    if "allowed_objects" in str(message):
        return
    return _orig_showwarning(message, category, filename, lineno, file, line)
warnings.showwarning = _suppress_langgraph_deprecation

# Ensure backend directory is in sys.path regardless of execution working directory
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from graph.orchestrator import build_graph, TutorState
from agents.content_agent import get_next_problem, generate_session_summary
from bkt.tracker import initialize_mastery, get_all_skills, get_skill_params
from db.supabase_client import get_supabase
from auth import create_session_token, verify_student_access
from rate_limiter import limiter

# ── In-memory session store (Supabase for persistence, memory for speed) ────
_sessions: dict[str, TutorState] = {}
_graph = None

# SSE Response headers to prevent proxy/CDN buffering (Render, Cloudflare, Nginx)
SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _graph
    _graph = build_graph()
    yield


app = FastAPI(title="AI Socratic Tutor API", lifespan=lifespan)

# CORS — allow frontend (local, custom FRONTEND_URL, and all Vercel domains)
frontend_env = os.getenv("FRONTEND_URL", "")
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4173",
]
if frontend_env:
    origins.extend([origin.strip().rstrip("/") for origin in frontend_env.split(",") if origin.strip()])

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "status": "ok",
        "service": "AI Socratic Tutor API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# In-memory health cache (TTL: 30 seconds) to prevent hammering Supabase on client polling
_last_db_check_time: float = 0.0
_cached_db_status: bool = False


# ── Pydantic Models ──────────────────────────────────────────────────────────

class StartSessionRequest(BaseModel):
    student_name: str
    student_id: str | None = None


class MessageRequest(BaseModel):
    session_id: str
    message: str


class MasteryUpdateRequest(BaseModel):
    session_id: str
    problem_id: str
    is_correct: bool


# ── Routes ───────────────────────────────────────────────────────────────────

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    global _last_db_check_time, _cached_db_status
    now = time.time()
    # Cache DB connectivity check for 30s so client health polling doesn't hammer remote DB
    if (now - _last_db_check_time) > 30.0:
        try:
            supabase = get_supabase()
            res = supabase.table("skills").select("id").limit(1).execute()
            _cached_db_status = res.data is not None
            _last_db_check_time = now
        except Exception as e:
            print(f"[WARN] Health DB ping check: {e}")
            _cached_db_status = False
            _last_db_check_time = now - 20.0  # retry in 10s if failed
    return {"status": "ok", "version": "1.0.0", "db": _cached_db_status}


@app.post("/session/start")
async def start_session(req: StartSessionRequest):
    """Create a new tutoring session, issue a scoped session token, and return the first problem."""
    supabase = get_supabase()

    student_id = None
    # 1. Reuse existing student if ID provided
    if req.student_id:
        try:
            existing = (
                supabase.table("students")
                .select("*")
                .eq("id", req.student_id)
                .single()
                .execute()
            )
            if existing.data:
                student_id = existing.data["id"]
        except Exception:
            student_id = None

    # 2. Otherwise create a new student record (supports multiple students with same first name)
    if not student_id:
        try:
            # Try inserting as a distinct student
            new_student = supabase.table("students").insert({"name": req.student_name}).execute()
            if new_student.data:
                student_id = new_student.data[0]["id"]
        except Exception:
            # Fallback if the database still retains a legacy UNIQUE(name) constraint
            try:
                found = supabase.table("students").select("*").eq("name", req.student_name).execute()
                if found.data:
                    student_id = found.data[0]["id"]
            except Exception as e:
                print(f"[WARN] Student lookup/creation fallback: {e}")

    # Fallback UUID if database offline/unreachable
    if not student_id:
        student_id = str(uuid.uuid4())

    # Load existing mastery or initialize fresh
    mastery_rows = (
        supabase.table("student_skill_mastery")
        .select("*")
        .eq("student_id", student_id)
        .execute()
    )
    mastery_state = initialize_mastery()
    for row in (mastery_rows.data or []):
        mastery_state[row["skill_id"]] = row["mastery_prob"]

    # Create session record
    session_id = str(uuid.uuid4())
    try:
        supabase.table("sessions").insert({
            "id": session_id,
            "student_id": student_id,
            "student_name": req.student_name,
        }).execute()
    except Exception as e:
        print(f"[WARN] Supabase session insert error: {e}")

    # Pick first problem
    from bkt.tracker import get_next_skill
    current_skill = get_next_skill(mastery_state)
    problem = get_next_problem(
        skill_id=current_skill,
        mastery_prob=mastery_state.get(current_skill, 0.3),
        student_id=student_id,
    )

    if not problem:
        raise HTTPException(status_code=503, detail="No problems available. Please run seed script.")

    # Generate cryptographically signed session token scoped to this student & session
    session_token = create_session_token(
        student_id=student_id,
        session_id=session_id,
        student_name=req.student_name,
    )

    # Initialize session state
    state: TutorState = {
        "student_id": student_id,
        "student_name": req.student_name,
        "session_id": session_id,
        "conversation_history": [],
        "latest_input": "",
        "latest_image_bytes": None,
        "current_problem": problem,
        "problems_attempted": [problem["id"]],
        "mastery_state": mastery_state,
        "current_skill_id": current_skill,
        "diagnosis": None,
        "agent_response": "",
        "thinking_steps": [],
        "next_action": None,
    }
    _sessions[session_id] = state

    return {
        "session_id": session_id,
        "student_id": student_id,
        "student_name": req.student_name,
        "session_token": session_token,
        "current_problem": problem,
        "mastery_state": mastery_state,
        "welcome_message": f"Hi {req.student_name}! I'm your math tutor. Let's start with this problem. Read it carefully, then tell me what you think the first step is!",
    }


@app.post("/session/message")
async def send_message(req: MessageRequest):
    """Send a student text message and get a streaming tutor response."""
    # Rate limit check (1.5s cooldown, max 30 msgs/minute per session)
    limiter.enforce_cooldown(
        key=f"msg_{req.session_id}",
        cooldown_seconds=1.5,
        action="message",
        max_per_minute=30,
    )

    if req.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    state = _sessions[req.session_id]
    state["latest_input"] = req.message
    state["latest_image_bytes"] = None

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # Emit thinking steps as they happen
            yield f"data: {json.dumps({'type': 'thinking', 'content': '🎓 Tutor thinking...'})}\n\n"

            # Run through LangGraph (tutor node)
            from agents.tutor_agent import run_tutor_agent

            thinking_steps = []
            thinking_steps.append("🎓 Reading your thought...")
            yield f"data: {json.dumps({'type': 'thinking', 'content': thinking_steps[-1]})}\n\n"
            await asyncio.sleep(0.1)

            response = run_tutor_agent(
                student_message=req.message,
                conversation_history=state["conversation_history"],
                current_problem=state.get("current_problem"),
            )

            thinking_steps.append("💡 Thinking of a guiding question...")
            yield f"data: {json.dumps({'type': 'thinking', 'content': thinking_steps[-1]})}\n\n"

            # Update state
            state["conversation_history"] = state["conversation_history"] + [
                {"role": "student", "content": req.message},
                {"role": "tutor", "content": response},
            ]
            state["thinking_steps"] = thinking_steps
            _sessions[req.session_id] = state

            # Stream the response word by word for a live feel
            words = response.split(" ")
            accumulated = ""
            for i, word in enumerate(words):
                accumulated += word + (" " if i < len(words) - 1 else "")
                if i % 3 == 0 or i == len(words) - 1:
                    yield f"data: {json.dumps({'type': 'response', 'content': accumulated, 'done': i == len(words) - 1})}\n\n"
                    await asyncio.sleep(0.04)

            yield f"data: {json.dumps({'type': 'done', 'mastery_state': state['mastery_state']})}\n\n"
        except Exception as e:
            print(f"[ERROR] Chat stream exception: {e}")
            fallback_msg = "I had a quick pause! Could you repeat that thought?"
            yield f"data: {json.dumps({'type': 'response', 'content': fallback_msg, 'done': True})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'mastery_state': state.get('mastery_state', {})})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


@app.post("/session/upload-work")
async def upload_work(
    session_id: str,
    file: UploadFile = File(...),
):
    """Upload a photo of student handwritten work for OCR + diagnosis."""
    # Rate limit check (3.0s cooldown, max 10 uploads/minute per session)
    limiter.enforce_cooldown(
        key=f"upload_{session_id}",
        cooldown_seconds=3.0,
        action="work upload",
        max_per_minute=10,
    )

    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    state = _sessions[session_id]
    image_bytes = await file.read()

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            yield f"data: {json.dumps({'type': 'thinking', 'content': '📸 Reading your handwritten work...'})}\n\n"
            await asyncio.sleep(0.1)

            from agents.diagnostic_agent import run_diagnostic_agent
            from bkt.tracker import update_mastery

            current_problem = state.get("current_problem") or {}
            yield f"data: {json.dumps({'type': 'thinking', 'content': '🔍 Checking your steps...'})}\n\n"

            diagnosis = run_diagnostic_agent(
                image_bytes=image_bytes,
                expected_steps=current_problem.get("expected_steps", []),
                problem_text=current_problem.get("text", ""),
                skill_id=state.get("current_skill_id", ""),
            )

            misconception = diagnosis.get('misconception_type', 'unknown')
            friendly_misc = misconception.replace('_', ' ')
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Checking step: ' + friendly_misc})}\n\n"

            # Update mastery
            skill_id = state["current_skill_id"]
            is_correct = diagnosis.get("is_correct", False)
            new_mastery = update_mastery(
                current_mastery=state["mastery_state"].get(skill_id, 0.3),
                is_correct=is_correct,
                skill_id=skill_id,
            )
            state["mastery_state"][skill_id] = new_mastery

            mastery_pct = f"{new_mastery*100:.0f}%"
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Updating skill progress: ' + mastery_pct})}\n\n"

            # Persist to Supabase
            try:
                supabase = get_supabase()
                supabase.table("student_skill_mastery").upsert({
                    "student_id": state["student_id"],
                    "skill_id": skill_id,
                    "mastery_prob": new_mastery,
                }, on_conflict="student_id,skill_id").execute()
                supabase.table("session_events").insert({
                    "session_id": state["session_id"],
                    "student_id": state["student_id"],
                    "problem_id": current_problem.get("id"),
                    "attempt_text": diagnosis.get("ocr_text", ""),
                    "is_correct": is_correct,
                    "agent_response": diagnosis.get("corrective_question", ""),
                }).execute()
            except Exception as e:
                print(f"[WARN] Supabase write failed: {e}")

            state["diagnosis"] = diagnosis
            _sessions[session_id] = state

            # If correct, select next problem targeted with pgvector RAG
            if is_correct:
                yield f"data: {json.dumps({'type': 'thinking', 'content': '📚 Picking your next practice problem...'})}\n\n"
                from bkt.tracker import get_next_skill
                next_skill = get_next_skill(state["mastery_state"])
                misconception_desc = diagnosis.get("description") or diagnosis.get("misconception_type")
                next_problem = get_next_problem(
                    skill_id=next_skill,
                    mastery_prob=state["mastery_state"].get(next_skill, 0.3),
                    student_id=state["student_id"],
                    exclude_problem_ids=state.get("problems_attempted", []),
                    misconception_text=misconception_desc,
                )
                if next_problem:
                    state["current_problem"] = next_problem
                    state["current_skill_id"] = next_skill
                    state["problems_attempted"] = state.get("problems_attempted", []) + [next_problem["id"]]
                    _sessions[session_id] = state

            yield f"data: {json.dumps({'type': 'diagnosis', 'diagnosis': diagnosis, 'mastery_state': state['mastery_state'], 'next_problem': state.get('current_problem')})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            print(f"[ERROR] upload_work stream failed: {e}")
            yield f"data: {json.dumps({'type': 'thinking', 'content': '⚠️ Recovering from analysis hiccup...'})}\n\n"
            fallback_diag = {
                "ocr_text": "Could not complete analysis",
                "is_correct": False,
                "step_number": 1,
                "misconception_type": "temporary_system_pause",
                "description": "The system encountered a brief delay processing this request.",
                "skill_gap": state.get("current_skill_id", ""),
                "skill_gap_name": "",
                "corrective_question": "I had a momentary glitch reading your work. Can you describe what step you took, or try uploading once more?",
                "bounding_hint": {"x": 10.0, "y": 20.0, "width": 80.0, "height": 22.0},
                "bounding_box": {"x": 10.0, "y": 20.0, "width": 80.0, "height": 22.0},
            }
            yield f"data: {json.dumps({'type': 'diagnosis', 'diagnosis': fallback_diag, 'mastery_state': state['mastery_state'], 'next_problem': state.get('current_problem')})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


@app.get("/student/{student_id}/mastery")
async def get_mastery(
    student_id: str,
    auth_payload: dict = Depends(verify_student_access),
):
    """Get the full mastery state for a student (protected by scoped session token)."""
    supabase = get_supabase()
    result = (
        supabase.table("student_skill_mastery")
        .select("*, skills(name, cc_standard, sequence_order)")
        .eq("student_id", student_id)
        .execute()
    )
    skills = get_all_skills()
    return {"student_id": student_id, "mastery": result.data, "all_skills": skills}


@app.get("/student/{student_id}/summary")
async def get_summary(
    student_id: str,
    session_id: str,
    auth_payload: dict = Depends(verify_student_access),
):
    """Generate an LLM session summary for teacher/parent dashboard (protected by scoped session token)."""
    supabase = get_supabase()

    student_row = supabase.table("students").select("*").eq("id", student_id).single().execute()
    events = (
        supabase.table("session_events")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    mastery_rows = (
        supabase.table("student_skill_mastery")
        .select("*")
        .eq("student_id", student_id)
        .execute()
    )
    mastery_state = {r["skill_id"]: r["mastery_prob"] for r in mastery_rows.data}

    summary = generate_session_summary(
        student_name=student_row.data["name"],
        problems_attempted=events.data,
        mastery_state=mastery_state,
        skill_params=get_all_skills(),
    )
    return {"summary": summary, "events": events.data}


@app.post("/tts")
async def text_to_speech(text: str):
    """Proxy ElevenLabs TTS to protect the API key."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "cgSgspJ2msm6clMCkdW9")

    if not api_key:
        raise HTTPException(status_code=503, detail="TTS not configured")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "text": text[:500],  # free tier limit
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=30,
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="TTS API error")

    return Response(content=resp.content, media_type="audio/mpeg")
