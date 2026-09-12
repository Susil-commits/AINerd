"""
FastAPI Backend — AI Socratic Tutor
All routes, streaming SSE, ElevenLabs TTS proxy, session management.
"""
import os
import sys
import re
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
from safety import (
    sanitize_input,
    check_prompt_injection,
    check_harmful_content,
    is_answer_leaked,
    validate_image_upload,
    record_security_event,
    get_security_telemetry,
    SOCRATIC_BOUNDARY_RESPONSE,
    SAFE_SUPPORT_RESPONSE,
)
from postgrest.base_request_builder import CountMethod

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

# Enforce security response headers on all routes (Defense-in-depth)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "status": "ok",
        "service": "AI Socratic Tutor API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/auth/security-status")
async def get_security_status():
    """Real-time platform security, guardrails status, and defense health."""
    return get_security_telemetry()


# In-memory health cache (TTL: 30 seconds) to prevent hammering Supabase on client polling
_last_db_check_time: float = 0.0
_cached_db_status: bool = False


# ── Pydantic Models ──────────────────────────────────────────────────────────

class StartSessionRequest(BaseModel):
    student_name: str
    student_id: str | None = None
    student_email: str | None = None


class AddChildRequest(BaseModel):
    parent_id: str
    parent_email: str | None = None
    child_email: str
    child_name: str | None = None


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
    # 1. Reuse or upsert student by authenticated auth.user.id
    if req.student_id:
        try:
            uuid.UUID(str(req.student_id))
        except (ValueError, AttributeError):
            raise HTTPException(422, "Invalid student_id: Must be a valid UUID format.")
        student_id = req.student_id
        try:
            upsert_payload = {"id": req.student_id, "name": req.student_name}
            if req.student_email:
                upsert_payload["email"] = req.student_email.strip().lower()
            supabase.table("students").upsert(upsert_payload).execute()
        except Exception:
            try:
                supabase.table("students").upsert({"id": req.student_id, "name": req.student_name}).execute()
            except Exception:
                try:
                    unique_name = f"{req.student_name} #{req.student_id[:4]}"
                    supabase.table("students").insert({"id": req.student_id, "name": unique_name}).execute()
                except Exception as e:
                    print(f"[WARN] Student upsert fallback: {e}")

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
    """Send a student text message and get a streaming tutor response with safety guardrails."""
    # Rate limit check (1.5s cooldown, max 30 msgs/minute per session)
    limiter.enforce_cooldown(
        key=f"msg_{req.session_id}",
        cooldown_seconds=1.5,
        action="message",
        max_per_minute=30,
    )

    if req.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Sanitize student input (length bound, strip control characters, escape HTML)
    clean_message = sanitize_input(req.message)
    if not clean_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 2. Safety Guardrails: Prompt injection & distress checks
    is_injection, injection_reason = check_prompt_injection(clean_message)
    is_harmful, harm_category = check_harmful_content(clean_message)

    if is_injection:
        record_security_event("prompt_injection_blocked", {
            "session_id": req.session_id,
            "reason": injection_reason,
            "preview": clean_message[:80],
        })
    if is_harmful:
        record_security_event("harmful_content_flagged", {
            "session_id": req.session_id,
            "category": harm_category,
        })

    state = _sessions[req.session_id]
    state["latest_input"] = clean_message
    state["latest_image_bytes"] = None

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # Emit thinking steps as they happen
            yield f"data: {json.dumps({'type': 'thinking', 'content': '🎓 Tutor thinking...'})}\n\n"

            thinking_steps = []
            thinking_steps.append("🎓 Reading your thought...")
            yield f"data: {json.dumps({'type': 'thinking', 'content': thinking_steps[-1]})}\n\n"
            await asyncio.sleep(0.1)

            # Route through safety boundary if flagged, otherwise invoke Socratic tutor
            if is_harmful:
                response = SAFE_SUPPORT_RESPONSE
            elif is_injection:
                response = SOCRATIC_BOUNDARY_RESPONSE
            else:
                from agents.tutor_agent import run_tutor_agent
                current_prob = state.get("current_problem") or {}
                response = run_tutor_agent(
                    student_message=clean_message,
                    conversation_history=state["conversation_history"],
                    current_problem=current_prob,
                )

                # Secondary safety check: Prevent accidental final answer disclosure
                prob_ans = current_prob.get("answer") or ""
                if prob_ans and is_answer_leaked(response, str(prob_ans)):
                    response = (
                        "That's a great direction! Let's pause right before the final calculation: "
                        "what math property explains why this step works?"
                    )

            thinking_steps.append("💡 Thinking of a guiding question...")
            yield f"data: {json.dumps({'type': 'thinking', 'content': thinking_steps[-1]})}\n\n"

            # Update state
            state["conversation_history"] = state["conversation_history"] + [
                {"role": "student", "content": clean_message},
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
    """Upload a photo of student handwritten work for OCR + diagnosis with strict upload validation."""
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

    # Safety: Validate image format, MIME type, and max 10MB file limit
    validate_image_upload(
        file_bytes=image_bytes,
        content_type=file.content_type,
        filename=file.filename,
    )

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


# ── Parent Dashboard & Child Management Endpoints ───────────────────────────

CHILDREN_FALLBACK_FILE = BACKEND_DIR.parent / "data" / "children_store.json"


def _get_fallback_children(parent_id: str) -> list[dict]:
    if not CHILDREN_FALLBACK_FILE.exists():
        return []
    try:
        with open(CHILDREN_FALLBACK_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [c for c in data if c.get("parent_id") == parent_id]
    except Exception:
        return []


def _save_fallback_child(record: dict):
    CHILDREN_FALLBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    current = []
    if CHILDREN_FALLBACK_FILE.exists():
        try:
            with open(CHILDREN_FALLBACK_FILE, "r", encoding="utf-8") as f:
                current = json.load(f)
        except Exception:
            current = []
    current = [
        c
        for c in current
        if not (
            c.get("parent_id") == record.get("parent_id")
            and c.get("student_id") == record.get("student_id")
        )
    ]
    current.append(record)
    with open(CHILDREN_FALLBACK_FILE, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=2)


@app.post("/parent/add-child")
async def add_child(req: AddChildRequest):
    """Link a child by email to a parent in the children table."""
    # 0. Safety Guardrails & Validation
    try:
        uuid.UUID(str(req.parent_id))
    except (ValueError, AttributeError):
        raise HTTPException(422, "Invalid parent_id: Must be a valid UUID format.")

    email_clean = req.child_email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email_clean):
        raise HTTPException(422, "Please enter a valid email address format.")

    if req.parent_email and req.parent_email.strip().lower() == email_clean:
        raise HTTPException(400, "A parent cannot link their own email as a child account.")

    # Rate limiting protection
    limiter.enforce_cooldown(f"parent_add_{req.parent_id}", cooldown_seconds=0.5, action="add child", max_per_minute=20)

    supabase = get_supabase()
    student_id = None
    student_name = req.child_name or email_clean.split("@")[0].capitalize()

    # 1. Search in Supabase Auth users
    try:
        users = supabase.auth.admin.list_users()
        for u in users:
            if getattr(u, "email", "").lower() == email_clean:
                student_id = u.id
                student_name = (
                    getattr(u, "user_metadata", {}).get("name") or student_name
                )
                break
    except Exception as e:
        print(f"[WARN] Supabase admin user search: {e}")

    # 2. Search in students table
    if not student_id:
        try:
            found = (
                supabase.table("students")
                .select("*")
                .eq("email", email_clean)
                .execute()
            )
            if found.data:
                student_id = found.data[0]["id"]
                student_name = found.data[0].get("name") or student_name
        except Exception:
            pass

    # 3. If student doesn't exist yet, create a registered student record
    if not student_id:
        student_id = str(uuid.uuid4())
        try:
            supabase.table("students").insert({
                "id": student_id,
                "name": student_name,
                "email": email_clean,
            }).execute()
        except Exception:
            try:
                supabase.table("students").insert({
                    "id": student_id,
                    "name": student_name,
                }).execute()
            except Exception:
                try:
                    found = supabase.table("students").select("id").eq("name", student_name).execute()
                    if found.data:
                        student_id = found.data[0]["id"]
                    else:
                        supabase.table("students").insert({
                            "id": student_id,
                            "name": f"{student_name} #{student_id[:4]}",
                        }).execute()
                except Exception as e:
                    print(f"[WARN] Could not create initial student record: {e}")

    # 4. Insert into children table (parent_id -> student_id)
    child_record = {
        "parent_id": req.parent_id,
        "student_id": student_id,
        "student_email": email_clean,
        "student_name": student_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    try:
        supabase.table("children").upsert({
            "parent_id": req.parent_id,
            "student_id": student_id,
            "student_email": email_clean,
            "student_name": student_name,
        }).execute()
    except Exception as e:
        print(f"[INFO] Children table fallback in local storage: {e}")
        _save_fallback_child(child_record)

    return {
        "status": "ok",
        "child": {
            "student_id": student_id,
            "student_name": student_name,
            "student_email": email_clean,
        },
    }


@app.get("/parent/{parent_id}/children")
async def get_parent_children(parent_id: str):
    """List all children linked to parent, including mastery overview and practice recency."""
    supabase = get_supabase()
    children_map: dict[str, dict] = {}

    # Read from Supabase children table
    try:
        res = (
            supabase.table("children")
            .select("*")
            .eq("parent_id", parent_id)
            .execute()
        )
        for c in res.data or []:
            children_map[c["student_id"]] = c
    except Exception as e:
        print(f"[INFO] Fetch children from table fallback: {e}")

    # Merge fallback records
    for c in _get_fallback_children(parent_id):
        if c["student_id"] not in children_map:
            children_map[c["student_id"]] = c

    # If demo parent has no children yet, supply demo child 'Alex'
    if not children_map and (
        parent_id == "99999999-8888-7777-6666-555555555555" or not children_map
    ):
        demo_child = {
            "parent_id": parent_id,
            "student_id": "24e836e3-3b42-41a0-8a27-222f883eaa10",
            "student_email": "student.alex@veritas.dev",
            "student_name": "Alex Jenkins",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        children_map[demo_child["student_id"]] = demo_child
        _save_fallback_child(demo_child)

    results = []
    now = time.time()

    for student_id, child in children_map.items():
        latest_session_time = None
        session_count = 0
        try:
            sess_res = (
                supabase.table("sessions")
                .select("started_at")
                .eq("student_id", student_id)
                .order("started_at", desc=True)
                .limit(1)
                .execute()
            )
            if sess_res.data:
                latest_session_time = sess_res.data[0].get("started_at")

            count_res = (
                supabase.table("sessions")
                .select("id", count=CountMethod.exact)
                .eq("student_id", student_id)
                .execute()
            )
            session_count = count_res.count or len(count_res.data or [])
        except Exception:
            pass

        # Check fraction mastery & activity
        fraction_mastery = 0.35
        try:
            m_res = (
                supabase.table("student_skill_mastery")
                .select("mastery_prob")
                .eq("student_id", student_id)
                .in_("skill_id", ["4.NF.B.3", "4.NF.A.1"])
                .execute()
            )
            if m_res.data:
                fraction_mastery = sum(r["mastery_prob"] for r in m_res.data) / len(
                    m_res.data
                )
        except Exception:
            pass

        days_since = 3
        if latest_session_time:
            try:
                import datetime

                ts = datetime.datetime.fromisoformat(
                    latest_session_time.replace("Z", "+00:00")
                )
                diff_seconds = now - ts.timestamp()
                days_since = max(0, int(diff_seconds // 86400))
            except Exception:
                days_since = 3

        has_gap = days_since >= 3 or fraction_mastery < 0.5
        alert_msg = (
            "⚠️ Has not practiced fractions in 3 days!"
            if has_gap
            else "Practiced fractions recently"
        )

        results.append({
            "student_id": student_id,
            "student_name": child.get("student_name", "Student"),
            "student_email": child.get("student_email", ""),
            "last_session_at": latest_session_time,
            "days_since_practice": days_since,
            "has_fraction_gap": has_gap,
            "fraction_alert_message": alert_msg,
            "fraction_mastery": fraction_mastery,
            "session_count": session_count,
        })

    return {"children": results}


@app.get("/parent/{parent_id}/child/{child_id}/details")
async def get_child_details(parent_id: str, child_id: str):
    """Return full mastery state and practice history for a child."""
    supabase = get_supabase()

    # Mastery
    mastery_rows = (
        supabase.table("student_skill_mastery")
        .select("*, skills(name, cc_standard, sequence_order)")
        .eq("student_id", child_id)
        .execute()
    )
    skills = get_all_skills()

    # Sessions history
    sessions_res = (
        supabase.table("sessions")
        .select("*")
        .eq("student_id", child_id)
        .order("started_at", desc=True)
        .limit(10)
        .execute()
    )

    # Recent session events
    events_res = (
        supabase.table("session_events")
        .select("*, problems(title, text)")
        .eq("student_id", child_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return {
        "student_id": child_id,
        "mastery": mastery_rows.data or [],
        "all_skills": skills,
        "sessions": sessions_res.data or [],
        "recent_events": events_res.data or [],
    }

