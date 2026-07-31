import logging

from fastapi import FastAPI

from app.core.config import settings
from app.routers import health

logging.basicConfig(level=settings.log_level.upper())

app = FastAPI(title="AI-TOS AI Service", version="0.0.0")
app.include_router(health.router)


@app.get("/")
def root() -> dict:
    return {"service": "ai-service", "status": "ok"}
