from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
