"""
Tutor Agent — Socratic dialogue, never gives the answer.
Uses Gemini 2.0 Flash via LangChain.
"""
# pyright: reportMissingImports=false, reportMissingModuleSource=false
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage

SOCRATIC_SYSTEM_PROMPT = """You are an expert math tutor using the Socratic method.

CRITICAL RULE: You MUST NEVER directly give the student the answer or the next step.
Instead, ask ONE guiding question at a time that helps them discover the answer themselves.

Your approach:
1. Acknowledge what they got right first (positive reinforcement)
2. If they're stuck, ask a simpler question that points toward the key insight
3. If they made an error, ask them to re-examine a specific part: "Let's look at step 2 again — what operation did you perform there?"
4. Use real-world analogies when helpful (e.g., fractions → pizza slices)
5. Keep responses SHORT — 1-3 sentences max, then a guiding question
6. Match energy to the student's age/level (be warm, encouraging, not condescending)

Misconception patterns to watch for:
- "Flipped operation" → Ask: "You multiplied here — what operation is the problem asking for?"
- "Sign error" → Ask: "What happens to the inequality sign when we divide by a negative number?"
- "Fraction numerator/denominator confusion" → Ask: "Which part of a fraction tells us how many pieces we have?"
- "Place value error" → Ask: "What does the digit in the tens place represent?"

Current problem context will be provided in the conversation.
Remember: Guide, don't tell. Questions, not answers."""

# Few-shot examples based on GSM8K style
FEW_SHOT_EXAMPLES = [
    {
        "student": "I got 15. I added 7 and 8.",
        "tutor": "Good start! You identified the two numbers correctly. But let's re-read the problem — is it asking us to combine those amounts, or find the difference? What word in the problem gives you a clue?"
    },
    {
        "student": "I don't know what to do.",
        "tutor": "That's okay — let's break it down together. What information does the problem give us? Can you tell me just the numbers you see?"
    },
    {
        "student": "Is the answer 3/8?",
        "tutor": "Interesting! Walk me through how you got that. What did you do with the two fractions first?"
    }
]


def build_tutor_llm() -> ChatGoogleGenerativeAI:
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.7,
        max_output_tokens=300,
    )


def run_tutor_agent(
    student_message: str,
    conversation_history: list[dict],
    current_problem: dict | None = None,
) -> str:
    """
    Given a student message and conversation history, return a Socratic guiding response.
    conversation_history: list of {"role": "student"|"tutor", "content": str}
    """
    llm = build_tutor_llm()

    # Build system message with current problem context
    system_content = SOCRATIC_SYSTEM_PROMPT
    if current_problem:
        system_content += f"""

CURRENT PROBLEM:
Title: {current_problem.get('title', '')}
Problem: {current_problem.get('text', '')}
Skill: {current_problem.get('skill_name', '')}
Difficulty: {current_problem.get('difficulty', 1)}/5

Expected solution steps (for your reference only — do NOT reveal these):
{chr(10).join(f"Step {i+1}: {s}" for i, s in enumerate(current_problem.get('expected_steps', [])))}
"""

    messages: list[BaseMessage] = [SystemMessage(content=system_content)]

    # Add few-shot examples
    for ex in FEW_SHOT_EXAMPLES:
        messages.append(HumanMessage(content=ex["student"]))
        messages.append(AIMessage(content=ex["tutor"]))

    # Add conversation history
    for turn in conversation_history[-10:]:  # last 10 turns max
        if turn["role"] == "student":
            messages.append(HumanMessage(content=turn["content"]))
        else:
            messages.append(AIMessage(content=turn["content"]))

    # Add current student message
    messages.append(HumanMessage(content=student_message))

    try:
        response = llm.invoke(messages)
        return str(response.content).strip()
    except Exception as e:
        err_str = str(e).lower()
        print(f"[WARN] Tutor agent invoke failed: {e}")
        if "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str:
            return "I'm pausing for just a moment while our tutor AI catches its breath! Please send your thought again in 10 seconds."
        return "I had a momentary glitch thinking through that. Could you share your thought with me one more time?"
