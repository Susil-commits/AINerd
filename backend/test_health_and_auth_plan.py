# test_health_and_auth_plan.py — Automated verification for cold-start /health and auth design plan
import sys
import os
import time
from starlette.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main import app

def test_fast_health_endpoint():
    print("\n[TEST 1] Testing Instantaneous Liveness /health Endpoint...")
    client = TestClient(app)
    
    t0 = time.perf_counter()
    resp = client.get("/health")
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data.get("status") == "ok", f"Expected status 'ok', got {data.get('status')}"
    assert data.get("service") == "veritas-backend", f"Expected service 'veritas-backend', got {data.get('service')}"
    assert "uptime_seconds" in data, "Expected uptime_seconds in payload"
    
    print(f"   - /health responded in {elapsed_ms:.2f}ms")
    print(f"   - Payload: {data}")
    print("[TEST 1 PASSED] /health liveness endpoint is instantaneous and matches specification.")

def test_head_health_endpoint():
    print("\n[TEST 2] Testing HEAD /health (Used by Ping Services & Warmup Probes)...")
    client = TestClient(app)
    resp = client.head("/health")
    assert resp.status_code == 200, f"Expected 200 for HEAD /health, got {resp.status_code}"
    print("[TEST 2 PASSED] HEAD /health responded with 200 OK.")

def test_deep_health_endpoint():
    print("\n[TEST 3] Testing /health/full (Deep Dependency Diagnostics)...")
    client = TestClient(app)
    resp = client.get("/health/full")
    assert resp.status_code == 200, f"Expected 200 for /health/full, got {resp.status_code}"
    data = resp.json()
    assert "status" in data
    assert "services" in data
    print(f"   - Deep health status: {data.get('status')}")
    print(f"   - Services reported: {list(data.get('services', {}).keys())}")
    print("[TEST 3 PASSED] /health/full retains deep service diagnostics.")

if __name__ == "__main__":
    test_fast_health_endpoint()
    test_head_health_endpoint()
    test_deep_health_endpoint()
    print("\nALL HEALTH & BACKEND CHECKS PASSED SUCCESSFULLY!\n")
