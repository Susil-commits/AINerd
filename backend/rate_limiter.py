"""
Rate Limiter & Cooldown Manager
Protects LLM (Gemini) and TTS (ElevenLabs) quotas from accidental multi-clicks,
rapid automated loops, and stress testing during demos.
"""
import time
from collections import defaultdict
from fastapi import HTTPException, status

class RateLimiter:
    def __init__(self):
        # Maps key -> last timestamp of request
        self._last_request_time: dict[str, float] = {}
        # Maps key -> list of recent timestamps
        self._request_history: dict[str, list[float]] = defaultdict(list)

    def enforce_cooldown(
        self,
        key: str,
        cooldown_seconds: float = 1.5,
        action: str = "messages",
        max_per_minute: int = 30,
    ):
        """
        Enforce both a minimum cooldown between requests and a maximum requests per minute cap.
        Throws HTTP 429 if violated.
        """
        now = time.time()
        last_time = self._last_request_time.get(key, 0.0)

        # 1. Enforce burst cooldown
        elapsed = now - last_time
        if elapsed < cooldown_seconds:
            remaining = round(cooldown_seconds - elapsed, 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please slow down! Wait {remaining}s before sending another {action}.",
                headers={"Retry-After": str(max(1, int(remaining)))},
            )

        # 2. Enforce sliding-window requests per minute
        history = self._request_history[key]
        one_min_ago = now - 60.0
        # prune older timestamps
        active_history = [t for t in history if t > one_min_ago]
        
        if len(active_history) >= max_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: maximum {max_per_minute} {action} per minute reached. Please pause for a moment.",
                headers={"Retry-After": "30"},
            )

        # Record this request
        active_history.append(now)
        self._request_history[key] = active_history
        self._last_request_time[key] = now

        # Housekeeping: keep size bounded
        if len(self._last_request_time) > 2000:
            threshold = now - 3600
            self._last_request_time = {k: v for k, v in self._last_request_time.items() if v > threshold}
            self._request_history = defaultdict(list, {k: v for k, v in self._request_history.items() if v and v[-1] > threshold})


# Global singleton instance
limiter = RateLimiter()
