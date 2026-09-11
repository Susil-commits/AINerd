"""
Content Agent — RAG-based problem selection using pgvector + mastery state.
Picks the NEXT problem targeted at the student's diagnosed skill gap.
"""
# pyright: reportMissingImports=false
import os
import json
from pydantic import SecretStr
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from db.supabase_client import get_supabase
from bkt.tracker import get_skill_params


def embed_text(text: str) -> list[float]:
    """Embed a text string using Gemini embedding model."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=SecretStr(api_key),
    )
    return embeddings.embed_query(text, output_dimensionality=768)


def get_next_problem(
    skill_id: str,
    mastery_prob: float,
    student_id: str,
    exclude_problem_ids: list[str] | None = None,
) -> dict | None:
    """
    Retrieve the next problem from Supabase pgvector, filtered by skill and difficulty.

    Difficulty selection logic:
        mastery < 0.4  → difficulty 1-2 (build confidence)
        0.4 ≤ mastery < 0.7 → difficulty 2-3 (consolidate)
        mastery ≥ 0.7  → difficulty 3-5 (challenge)
    """
    supabase = get_supabase()

    # Determine target difficulty range
    if mastery_prob < 0.4:
        min_diff, max_diff = 1, 2
    elif mastery_prob < 0.7:
        min_diff, max_diff = 2, 3
    else:
        min_diff, max_diff = 3, 5

    # Build query: filter by skill + difficulty, exclude already-seen problems
    query = (
        supabase.table("problems")
        .select("*")
        .eq("skill_id", skill_id)
        .gte("difficulty", min_diff)
        .lte("difficulty", max_diff)
    )

    if exclude_problem_ids:
        query = query.not_.in_("id", exclude_problem_ids)

    result = query.limit(5).execute()

    if not result.data:
        # Fallback: get any problem with this skill, regardless of difficulty
        result = supabase.table("problems").select("*").eq("skill_id", skill_id).limit(3).execute()

    if not result.data:
        return None

    # Pick the first available problem (could enhance with semantic ranking)
    return result.data[0]


def generate_session_summary(
    student_name: str,
    problems_attempted: list[dict],
    mastery_state: dict[str, float],
    skill_params: list[dict],
) -> str:
    """
    Generate an LLM-written session summary for the teacher/parent dashboard.
    """
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.4,
        max_output_tokens=500,
    )

    # Build mastery summary string
    skill_lookup = {s["id"]: s["name"] for s in skill_params}
    mastery_lines = []
    for skill_id, prob in mastery_state.items():
        name = skill_lookup.get(skill_id, skill_id)
        level = "🟢 Strong" if prob >= 0.7 else ("🟡 Developing" if prob >= 0.4 else "🔴 Needs work")
        mastery_lines.append(f"  • {name}: {level} ({prob*100:.0f}%)")

    # Summarize attempts
    attempts_lines = []
    for p in problems_attempted[-5:]:  # last 5 problems
        status = "✓ Correct" if p.get("is_correct") else f"✗ {p.get('misconception_type', 'incorrect')}"
        attempts_lines.append(f"  • {p.get('problem_title', 'Problem')}: {status}")

    prompt = f"""Write a warm, professional 3-paragraph session summary for a parent or teacher about {student_name}'s tutoring session.

SKILL MASTERY:
{chr(10).join(mastery_lines)}

PROBLEMS ATTEMPTED:
{chr(10).join(attempts_lines)}

Paragraph 1: What the student worked on today and their overall engagement.
Paragraph 2: Specific strengths observed and any misconceptions identified (be specific, not generic).
Paragraph 3: Recommended next steps for the student and one encouragement note for the parent.

Keep it under 150 words total. Warm, specific, actionable."""

    messages = [
        SystemMessage(content="You are an expert education data analyst writing parent-facing session reports."),
        HumanMessage(content=prompt),
    ]
    try:
        response = llm.invoke(messages)
        return str(response.content).strip()
    except Exception as e:
        print(f"[WARN] Failed to generate LLM summary: {e}")
        return f"{student_name} completed an active practice session today. The tutor tracked student engagement across core Common Core math concepts. Continued practice with targeted guidance is recommended to solidify problem-solving fluency."
