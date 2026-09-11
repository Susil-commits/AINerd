"""
Diagnostic Agent — OCR + misconception detection using Gemini Vision.
Identifies SPECIFIC errors in student handwritten work, not generic "wrong answer."
"""
import os
import base64
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# Real misconception examples from Eedi/NeurIPS 2020 education research
# These few-shot examples teach the model to name SPECIFIC misconceptions
EEDI_FEW_SHOT_MISCONCEPTIONS = """
MISCONCEPTION LIBRARY (use these categories when diagnosing):

1. "sign_flip_division_negative" — Student flips the inequality/sign when dividing by a positive (should only flip for negative)
   Example: 2x < 8 → student writes x > 4 instead of x < 4

2. "fraction_inversion" — Student invides numerator and denominator when they shouldn't
   Example: 3/4 + 1/4 → student computes 4/3 + 4/1

3. "wrong_operation_keyword" — Student uses wrong operation despite correct keywords (e.g., "total" → multiplication instead of addition)
   Example: "3 bags of 4 apples" → student adds 3+4=7 instead of 3×4=12

4. "denominator_addition" — Student adds denominators when adding fractions (most common fraction error)
   Example: 1/3 + 1/4 = 2/7 instead of 7/12

5. "place_value_confusion" — Student misreads place values in multi-digit operations
   Example: 34 × 5 → student treats 3 as ones, computes 4×5 + 3 = 23

6. "order_of_operations_skip" — Student ignores PEMDAS/BODMAS (e.g., adds before multiplying)
   Example: 2 + 3 × 4 → student computes 5 × 4 = 20 instead of 2 + 12 = 14

7. "carry_error" — Student forgets to carry in multi-digit addition/multiplication
   Example: 47 + 38 → gets 75 instead of 85

8. "negative_number_confusion" — Student treats negative numbers as positive in operations
   Example: -3 + (-4) → student computes 3 + 4 = 7

9. "variable_coefficient_ignored" — Student ignores the coefficient when solving equations
   Example: 3x = 12 → student writes x = 12 instead of x = 4

10. "step_skipped_correctly" — No error found; student's logic is sound
"""

DIAGNOSTIC_SYSTEM_PROMPT = f"""You are an expert math education diagnostician.
Your job is to analyze a student's handwritten work and identify the SPECIFIC misconception that caused an error.

{EEDI_FEW_SHOT_MISCONCEPTIONS}

You will receive:
1. An image of the student's handwritten work (if provided)
2. The expected solution steps for the problem

Your task:
1. First, READ the student's handwritten work carefully (OCR it mentally)
2. Compare it step-by-step against the expected solution
3. Identify exactly WHERE the reasoning broke and WHAT misconception caused it
4. Return ONLY a JSON object (no markdown, no explanation outside the JSON)

Output format:
{{
  "ocr_text": "exact text you read from the handwriting",
  "is_correct": false,
  "step_number": 2,
  "misconception_type": "denominator_addition",
  "description": "Student added the denominators (1/3 + 1/4 = 2/7) instead of finding a common denominator. This is the most common fraction addition error.",
  "skill_gap": "4.NF.B.3",
  "skill_gap_name": "Adding and subtracting fractions",
  "corrective_question": "When we add fractions, can we add the bottom numbers? What do we need to make the denominators the same first?",
  "bounding_hint": "step_2"
}}

If the work is correct, set is_correct=true and misconception_type="step_skipped_correctly".
Be specific and educational — a teacher should be able to show this diagnosis to a student."""


def build_vision_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.environ["GEMINI_API_KEY"],
        temperature=0.2,  # Low temperature for precise diagnosis
        max_output_tokens=600,
    )


def run_diagnostic_agent(
    image_bytes: bytes | None,
    expected_steps: list[str],
    problem_text: str,
    skill_id: str,
) -> dict:
    """
    Run the diagnostic agent on a student's handwritten work.

    Args:
        image_bytes: Raw image bytes (JPEG/PNG) of handwritten work. None for text-only.
        expected_steps: List of expected solution steps for this problem.
        problem_text: The full problem text.
        skill_id: The skill ID this problem tests.

    Returns:
        dict with ocr_text, is_correct, misconception_type, description, skill_gap, corrective_question, bounding_hint
    """
    llm = build_vision_llm()

    steps_formatted = "\n".join(f"Step {i+1}: {s}" for i, s in enumerate(expected_steps))
    context = f"""
PROBLEM: {problem_text}

EXPECTED SOLUTION STEPS:
{steps_formatted}

Skill being tested: {skill_id}

Please analyze the student's handwritten work shown in the image and identify any misconceptions.
Return ONLY the JSON diagnosis object, no other text.
"""

    if image_bytes:
        # Encode image as base64 for Gemini Vision
        img_b64 = base64.b64encode(image_bytes).decode("utf-8")
        messages = [
            SystemMessage(content=DIAGNOSTIC_SYSTEM_PROMPT),
            HumanMessage(content=[
                {"type": "text", "text": context},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"},
                },
            ]),
        ]
    else:
        # Text-only mode (no image uploaded)
        messages = [
            SystemMessage(content=DIAGNOSTIC_SYSTEM_PROMPT),
            HumanMessage(content=context + "\n\nNote: No image was provided. Respond with a placeholder diagnosis."),
        ]

    response = llm.invoke(messages)
    raw = str(response.content).strip()

    # Strip markdown code fences if model wraps in them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: return a safe default
        return {
            "ocr_text": "Could not parse handwriting",
            "is_correct": False,
            "step_number": 1,
            "misconception_type": "unknown",
            "description": "Could not identify a specific misconception. Please try uploading a clearer image.",
            "skill_gap": skill_id,
            "skill_gap_name": "",
            "corrective_question": "Can you walk me through your steps out loud?",
            "bounding_hint": "step_1",
        }
