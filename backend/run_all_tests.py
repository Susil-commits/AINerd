"""
Veritas Master Test Runner — Runs all verified automated test suites.
Produces a crisp terminal output designed for Demo Day screen recording.
"""
import sys
import subprocess
import time
from pathlib import Path

if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
        getattr(sys.stderr, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

BACKEND_DIR = Path(__file__).resolve().parent

TEST_SCRIPTS = [
    ("test_session_persistence.py", "Day-3 Resiliency & Session Persistence"),
    ("test_production_rls.py", "Production RLS & Credential Isolation"),
    ("test_safety.py", "Platform Safety & Socratic Guardrails"),
    ("test_auth_and_rag.py", "Student Scoping, Rate Limiting & RAG Retrieval"),
    ("test_parent_child_flow.py", "Parent-Child Architecture & Inactivity Alerts"),
]

def main():
    print("=" * 70)
    print("   VERITAS AI SOCRATIC TUTOR — AUTOMATED VALIDATION SUITE")
    print("=" * 70)
    start_time = time.time()
    passed = 0

    for script, name in TEST_SCRIPTS:
        print(f"\n▶ Running {name} ({script})...")
        t0 = time.time()
        res = subprocess.run([sys.executable, script], cwd=str(BACKEND_DIR))
        elapsed = time.time() - t0
        if res.returncode == 0:
            print(f"  ✓ {name} passed in {elapsed:.2f}s")
            passed += 1
        else:
            print(f"  ✗ {name} failed with exit code {res.returncode}")
            sys.exit(res.returncode)

    total_time = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"  ALL {passed}/{len(TEST_SCRIPTS)} TEST SUITES PASSED IN {total_time:.2f}s!")
    print("  STATUS: 100% PRODUCTION READY & DEMO-DAY BULLETPROOF")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
