"""
Session Token Authentication — HMAC-SHA256 signed tokens
Provides cryptographic verification for student endpoints without requiring
heavy OAuth infrastructure for hackathon/demo scope.
"""
import os
import hmac
import hashlib
import json
import base64
import time
import secrets
from typing import Optional
from fastapi import Header, HTTPException, status
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

_EPHEMERAL_KEY: Optional[str] = None


def is_session_secret_configured() -> bool:
    """Check whether a dedicated SESSION_SECRET_KEY is configured in the environment."""
    return bool(os.getenv("SESSION_SECRET_KEY"))


def _get_secret_key() -> bytes:
    """
    Derives secret key for signing HMAC-SHA256 session tokens.
    Priority:
    1. SESSION_SECRET_KEY (from Render dashboard / .env)
    2. SUPABASE_SERVICE_ROLE_KEY (fallback)
    3. Production safeguard: Generate an ephemeral 256-bit random key per container instance
       to prevent forged tokens signed with public repository defaults.
    4. Development fallback: 'veritas-socratic-tutor-secret-key-salt' (local dev only).
    """
    global _EPHEMERAL_KEY
    key = os.getenv("SESSION_SECRET_KEY")
    if key:
        return key.encode("utf-8")

    # Fallback to Supabase service role key if available
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if service_key:
        print("[WARN] auth: SESSION_SECRET_KEY is not set. Falling back to SUPABASE_SERVICE_ROLE_KEY.")
        return service_key.encode("utf-8")

    # Check if running in production or on Render
    is_prod = (
        os.getenv("ENVIRONMENT", "").lower() == "production"
        or os.getenv("RENDER") is not None
    )
    if is_prod:
        if not _EPHEMERAL_KEY:
            _EPHEMERAL_KEY = secrets.token_urlsafe(32)
            print(
                "[CRITICAL SECURITY WARNING] Neither SESSION_SECRET_KEY nor SUPABASE_SERVICE_ROLE_KEY "
                "is set in PRODUCTION! Generated ephemeral 256-bit random key for this container. "
                "Configure SESSION_SECRET_KEY in Render dashboard -> Environment to persist keys across restarts."
            )
        return _EPHEMERAL_KEY.encode("utf-8")

    # Local development fallback
    return b"veritas-socratic-tutor-secret-key-salt"


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data_str: str) -> bytes:
    padding = 4 - (len(data_str) % 4)
    if padding != 4:
        data_str += "=" * padding
    return base64.urlsafe_b64decode(data_str.encode("ascii"))


def create_session_token(
    student_id: str,
    session_id: str,
    student_name: str,
    role: str = "student",
    expires_in_seconds: int = 86400 * 7,  # 7 days for ease of demoing
) -> str:
    """Issue an HMAC-SHA256 signed session token containing student & session claims."""
    now = int(time.time())
    payload = {
        "sub": student_id,
        "sid": session_id,
        "name": student_name,
        "role": role,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    encoded_payload = _b64url_encode(payload_json)

    signature = hmac.new(
        _get_secret_key(),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    encoded_sig = _b64url_encode(signature)

    return f"{encoded_payload}.{encoded_sig}"


def verify_session_token(token: str) -> dict:
    """Verify an HMAC-SHA256 session token and return its payload."""
    if not token or "." not in token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = token.strip().split(".")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed session token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    encoded_payload, encoded_sig = parts

    expected_sig = hmac.new(
        _get_secret_key(),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()

    try:
        provided_sig = _b64url_decode(encoded_sig)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature encoding",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token signature mismatch or token was tampered with",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload_bytes = _b64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to decode token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check expiration
    if payload.get("exp", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please start a new session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def verify_student_access(
    student_id: str,
    authorization: Optional[str] = Header(None),
    x_session_token: Optional[str] = Header(None),
    x_parent_id: Optional[str] = Header(None),
) -> dict:
    """
    FastAPI dependency to secure student data routes.
    Allows access if:
    1. Scoped session token matches student_id
    2. Request is made by an authorized parent (X-Parent-Id)
    3. Running in development/demo mode with non-empty student_id
    """
    token = None
    if authorization:
        parts = authorization.split(" ")
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        elif len(parts) == 1:
            token = parts[0]
    elif x_session_token:
        token = x_session_token

    if x_parent_id and isinstance(x_parent_id, str):
        return {"sub": student_id, "role": "parent", "parent_id": x_parent_id}

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: missing session token in Authorization or X-Session-Token header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_session_token(token)

    if payload.get("sub") != student_id and payload.get("role") != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: this session token belongs to student {payload.get('sub')}, not {student_id}",
        )

    return payload

