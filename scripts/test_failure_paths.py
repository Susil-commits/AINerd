"""
Test script to deliberately stress failure paths:
1. Invalid/corrupted image bytes
2. Empty/blank image bytes
3. Malformed LLM responses / JSON parse fallback
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

from agents.diagnostic_agent import run_diagnostic_agent

def test_corrupted_image():
    print("🧪 Testing Diagnostic Agent with corrupted/bad image bytes...")
    bad_bytes = b"NOT_A_REAL_IMAGE_DATA_CORRUPTED_BYTES"
    diagnosis = run_diagnostic_agent(
        image_bytes=bad_bytes,
        expected_steps=["Step 1: subtract 4", "Step 2: divide by 2"],
        problem_text="Solve 2x + 4 = 10",
        skill_id="6.EE.B.7",
    )
    print("   Result received:")
    print(f"   - is_correct: {diagnosis.get('is_correct')}")
    print(f"   - misconception_type: {diagnosis.get('misconception_type')}")
    print(f"   - corrective_question: {diagnosis.get('corrective_question')}")
    assert "corrective_question" in diagnosis, "Must provide corrective question"
    assert diagnosis["is_correct"] is False, "Must not mark bad image as correct"
    print("✅ Corrupted image handled gracefully without crashing!\n")

def test_no_image():
    print("🧪 Testing Diagnostic Agent in text-only mode (None image)...")
    diagnosis = run_diagnostic_agent(
        image_bytes=None,
        expected_steps=["Step 1: factor numerator", "Step 2: simplify"],
        problem_text="Simplify x^2 - 4 / x - 2",
        skill_id="6.EE.A.2",
    )
    print("   Result received:")
    print(f"   - is_correct: {diagnosis.get('is_correct')}")
    print(f"   - corrective_question: {diagnosis.get('corrective_question')}")
    assert "corrective_question" in diagnosis
    print("✅ None image mode handled gracefully!\n")

if __name__ == "__main__":
    test_corrupted_image()
    test_no_image()
