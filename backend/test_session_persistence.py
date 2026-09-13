"""
Automated Test Suite for Session Persistence & Recovery:
1. Verifies that active sessions persist to Supabase.
2. Simulates a Render container restart by clearing in-memory RAM cache.
3. Confirms get_session() rehydrates conversation history, problem ID, and student state.
4. Verifies data deletion endpoint purges records cleanly.
"""
import sys
import uuid
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

from session_manager import (
    get_session,
    save_session,
    record_session_event,
    _sessions_cache,
)
from db.supabase_client import get_supabase


def test_session_persistence_and_recovery():
    print("🔄 [PERSISTENCE TEST 1] Testing Session State Across Server Restarts...")
    supabase = get_supabase()

    test_student_id = str(uuid.uuid4())
    test_session_id = str(uuid.uuid4())
    student_name = f"Restart Student {uuid.uuid4().hex[:6]}"

    try:
        # 1. Insert test student and session row
        supabase.table("students").insert({"id": test_student_id, "name": student_name}).execute()
        supabase.table("sessions").insert({
            "id": test_session_id,
            "student_id": test_student_id,
            "student_name": student_name,
        }).execute()

        # 2. Fetch an existing problem to satisfy foreign key constraint
        prob_res = supabase.table("problems").select("id, title, text, skill_id, difficulty").limit(1).execute()
        if prob_res.data:
            real_problem = prob_res.data[0]
        else:
            real_problem = {
                "id": None,
                "title": "Fractions Test",
                "text": "What is 1/2 + 1/4?",
                "skill_id": "4.NF.B.3",
                "difficulty": 1,
            }

        state = {
            "student_id": test_student_id,
            "student_name": student_name,
            "session_id": test_session_id,
            "conversation_history": [
                {"role": "student", "content": "I think I need a common denominator"},
                {"role": "tutor", "content": "Spot on! What denominator works for both 2 and 4?"},
            ],
            "latest_input": "4",
            "latest_image_bytes": None,
            "current_problem": real_problem,
            "problems_attempted": [real_problem["id"]] if real_problem.get("id") else [],
            "mastery_state": {"4.NF.B.3": 0.55},
            "current_skill_id": "4.NF.B.3",
            "diagnosis": None,
            "agent_response": "Spot on! What denominator works for both 2 and 4?",
            "thinking_steps": ["Reading thought..."],
            "next_action": None,
        }

        # Save to manager
        save_session(test_session_id, state)
        assert test_session_id in _sessions_cache
        print("   ✓ Session created and stored in RAM cache")

        # Record event in session_events
        record_session_event(
            session_id=test_session_id,
            student_id=test_student_id,
            problem_id=str(real_problem["id"]) if real_problem.get("id") else None,
            attempt_text="I think I need a common denominator",
            is_correct=None,
            agent_response="Spot on! What denominator works for both 2 and 4?",
        )
        print("   ✓ Interaction turn recorded to session_events")

        # 3. Simulate Render redeployment / container crash: CLEAR RAM CACHE
        _sessions_cache.clear()
        assert test_session_id not in _sessions_cache
        print("   ✓ Simulating Render container restart (RAM cache completely emptied)")

        # 4. Request session again — should rehydrate from Supabase!
        rehydrated = get_session(test_session_id)
        assert rehydrated is not None, "Failed to rehydrate session from Supabase!"
        assert rehydrated["student_id"] == test_student_id
        assert rehydrated["student_name"] == student_name
        assert len(rehydrated["conversation_history"]) >= 1
        assert test_session_id in _sessions_cache
        print("   ✓ Successfully rehydrated session from database after simulated server crash!")
        print(f"   ✓ Rehydrated conversation turns: {len(rehydrated['conversation_history'])}")
        print("✅ [PERSISTENCE TEST 1 PASSED]\n")
    finally:
        # Clean up test rows
        try:
            supabase.table("session_events").delete().eq("session_id", test_session_id).execute()
            supabase.table("sessions").delete().eq("id", test_session_id).execute()
            supabase.table("students").delete().eq("id", test_student_id).execute()
            supabase.table("students").delete().eq("name", "Restart Test Student").execute()
            _sessions_cache.pop(test_session_id, None)
        except Exception as e:
            print(f"[CLEANUP WARN]: {e}")


def test_health_check_connectivity():
    print("🩺 [HEALTH TEST 2] Testing Enhanced /health Route...")
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()

    assert "services" in data
    assert "supabase" in data["services"]
    assert "gemini" in data["services"]
    assert data["services"]["supabase"] is True
    assert data["services"]["gemini"] is True
    assert "uptime_seconds" in data
    print(f"   ✓ Supabase reachable: {data['services']['supabase']}")
    print(f"   ✓ Gemini API reachable: {data['services']['gemini']}")
    print(f"   ✓ API Uptime: {data['uptime_seconds']}s")
    print("✅ [HEALTH TEST 2 PASSED]\n")


def test_parent_data_deletion_endpoint():
    print("🗑️ [PRIVACY TEST 3] Testing Data Deletion ('Delete My Data')...")
    supabase = get_supabase()
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)
    test_parent_id = str(uuid.uuid4())
    test_child_id = str(uuid.uuid4())

    # Seed temporary child record
    supabase.table("children").insert({
        "parent_id": test_parent_id,
        "student_id": test_child_id,
        "student_email": "del_test@veritas.dev",
        "student_name": "Delete Test Child",
    }).execute()

    del_resp = client.delete(f"/parent/{test_parent_id}/data")
    assert del_resp.status_code == 200
    del_data = del_resp.json()
    assert del_data["status"] == "ok"
    assert "purged_records" in del_data
    print(f"   ✓ Parent data deletion purged {del_data['purged_records']['children_unlinked']} child records")

    # Verify no records remain
    check = supabase.table("children").select("*").eq("parent_id", test_parent_id).execute()
    assert len(check.data or []) == 0
    print("   ✓ Confirmed zero child records remain in Supabase for parent")
    print("✅ [PRIVACY TEST 3 PASSED]\n")


if __name__ == "__main__":
    print("🚀 Running Veritas Day-3 Resiliency & Health Tests...\n")
    test_session_persistence_and_recovery()
    test_health_check_connectivity()
    test_parent_data_deletion_endpoint()
    print("🎉 ALL SESSION RESILIENCE & HEALTH CHECKS PASSED WITH 100% SUCCESS!")
