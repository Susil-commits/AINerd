"""
LangGraph Orchestrator — 3-agent pipeline with state management.
Routes between: Tutor Agent, Diagnostic Agent, Content Agent.
"""
# pyright: reportMissingImports=false
import os
from typing import TypedDict, Literal, Any
from langgraph.graph import StateGraph, END, START

from agents.tutor_agent import run_tutor_agent
from agents.diagnostic_agent import run_diagnostic_agent
from agents.content_agent import get_next_problem
from bkt.tracker import update_mastery, get_next_skill, get_all_skills
from db.supabase_client import get_supabase


# ── State Schema ────────────────────────────────────────────────────────────

class TutorState(TypedDict):
    # Session metadata
    student_id: str
    student_name: str
    session_id: str

    # Conversation
    conversation_history: list[dict]     # [{"role": "student"|"tutor", "content": str}]
    latest_input: str                    # latest student text message
    latest_image_bytes: bytes | None     # latest uploaded photo

    # Current problem
    current_problem: dict | None
    problems_attempted: list[str]        # problem IDs seen this session

    # Mastery
    mastery_state: dict[str, float]      # {skill_id: probability}
    current_skill_id: str

    # Diagnosis result (set after photo upload)
    diagnosis: dict | None

    # Agent output
    agent_response: str
    thinking_steps: list[str]           # streamed to UI for transparency

    # Routing
    next_action: Literal["tutor", "diagnose", "select_problem", "end"] | None


# ── Node Functions ───────────────────────────────────────────────────────────

def tutor_node(state: TutorState) -> dict:
    """Socratic tutor — responds to student text messages."""
    steps = state.get("thinking_steps", [])
    steps.append("🎓 Tutor agent: formulating Socratic response...")

    response = run_tutor_agent(
        student_message=state["latest_input"],
        conversation_history=state["conversation_history"],
        current_problem=state.get("current_problem"),
    )

    # Update conversation history
    history = state["conversation_history"] + [
        {"role": "student", "content": state["latest_input"]},
        {"role": "tutor", "content": response},
    ]

    steps.append("✅ Tutor response ready")

    return {
        "agent_response": response,
        "conversation_history": history,
        "thinking_steps": steps,
        "next_action": None,
    }


def diagnose_node(state: TutorState) -> dict:
    """Diagnostic agent — OCR + misconception detection on uploaded image."""
    steps = state.get("thinking_steps", [])
    steps.append("🔍 Diagnostic agent: reading handwritten work...")

    current_problem = state.get("current_problem") or {}
    diagnosis = run_diagnostic_agent(
        image_bytes=state.get("latest_image_bytes"),
        expected_steps=current_problem.get("expected_steps", []),
        problem_text=current_problem.get("text", ""),
        skill_id=state.get("current_skill_id", ""),
    )

    steps.append(f"🔬 Found: {diagnosis.get('misconception_type', 'unknown')} at step {diagnosis.get('step_number', '?')}")

    # Update mastery based on correctness
    mastery_state = dict(state["mastery_state"])
    skill_id = state["current_skill_id"]
    is_correct = diagnosis.get("is_correct", False)
    new_mastery = update_mastery(
        current_mastery=mastery_state.get(skill_id, 0.3),
        is_correct=is_correct,
        skill_id=skill_id,
    )
    mastery_state[skill_id] = new_mastery

    # Persist mastery to Supabase
    _save_mastery(state["student_id"], skill_id, new_mastery)

    steps.append(f"📊 Mastery for {skill_id}: {new_mastery*100:.0f}%")

    # Log the session event
    _log_event(
        session_id=state["session_id"],
        student_id=state["student_id"],
        problem_id=current_problem.get("id"),
        attempt_text=diagnosis.get("ocr_text", ""),
        is_correct=is_correct,
        agent_response=diagnosis.get("corrective_question", ""),
    )

    return {
        "diagnosis": diagnosis,
        "mastery_state": mastery_state,
        "thinking_steps": steps,
        "agent_response": diagnosis.get("corrective_question", "Let's try again."),
        "next_action": "select_problem" if is_correct else None,
    }


def select_problem_node(state: TutorState) -> dict:
    """Content agent — selects the next problem based on mastery."""
    steps = state.get("thinking_steps", [])
    steps.append("📚 Content agent: finding the best next problem...")

    # Determine next skill
    next_skill = get_next_skill(state["mastery_state"])
    mastery_prob = state["mastery_state"].get(next_skill, 0.3)

    steps.append(f"🎯 Targeting skill: {next_skill} (mastery: {mastery_prob*100:.0f}%)")

    problem = get_next_problem(
        skill_id=next_skill,
        mastery_prob=mastery_prob,
        student_id=state["student_id"],
        exclude_problem_ids=state.get("problems_attempted", []),
    )

    if problem is None:
        return {
            "agent_response": "Amazing work! You've completed all available problems for today. 🎉",
            "next_action": "end",
            "thinking_steps": steps,
        }

    attempted = state.get("problems_attempted", []) + [problem["id"]]
    steps.append(f"✅ Selected problem: {problem.get('title', problem['id'])}")

    return {
        "current_problem": problem,
        "current_skill_id": next_skill,
        "problems_attempted": attempted,
        "agent_response": f"Great job! Let's try a new problem:\n\n**{problem.get('title', 'Problem')}**\n\n{problem['text']}",
        "thinking_steps": steps,
        "next_action": None,
    }


# ── Routing ─────────────────────────────────────────────────────────────────

def route(state: TutorState) -> str:
    action = state.get("next_action")
    if action == "select_problem":
        return "select_problem"
    if action == "end":
        return END
    return END


# ── Graph Assembly ───────────────────────────────────────────────────────────

def build_graph() -> Any:
    builder = StateGraph(TutorState)

    builder.add_node("tutor", tutor_node)
    builder.add_node("diagnose", diagnose_node)
    builder.add_node("select_problem", select_problem_node)

    # Tutor: always ends (response returned to frontend)
    builder.add_edge("tutor", END)

    # Diagnose: conditionally moves to select_problem (on correct answer)
    builder.add_conditional_edges("diagnose", route, {
        "select_problem": "select_problem",
        END: END,
    })

    # Select problem: always ends
    builder.add_edge("select_problem", END)

    # Entry point: START → tutor (default; photo flow invokes diagnose_node directly)
    builder.add_edge(START, "tutor")

    return builder.compile()


# ── Supabase Helpers ─────────────────────────────────────────────────────────

def _save_mastery(student_id: str, skill_id: str, mastery_prob: float):
    try:
        supabase = get_supabase()
        supabase.table("student_skill_mastery").upsert({
            "student_id": student_id,
            "skill_id": skill_id,
            "mastery_prob": mastery_prob,
        }, on_conflict="student_id,skill_id").execute()
    except Exception as e:
        print(f"[WARN] Failed to save mastery: {e}")


def _log_event(session_id, student_id, problem_id, attempt_text, is_correct, agent_response):
    try:
        supabase = get_supabase()
        supabase.table("session_events").insert({
            "session_id": session_id,
            "student_id": student_id,
            "problem_id": problem_id,
            "attempt_text": attempt_text,
            "is_correct": is_correct,
            "agent_response": agent_response,
        }).execute()
    except Exception as e:
        print(f"[WARN] Failed to log event: {e}")
