# ai-service — AI Service (Phase 0A)

Python / FastAPI service. LangGraph/LangChain-ready. **No AI logic.**

## Stack
FastAPI · Pydantic · Uvicorn.

## Scripts
- `uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Health
`GET /health` → `{ status: "ok", service: "ai-service", ... }`.

## Adapters
`app/providers/` defines `LLMProvider` with OpenAI / Gemini / Claude implementations.
All raise `NotImplementedError` — wired in later phases.

## Configuration
See `.env.example` (LLM API keys are empty placeholders).

## Notes
Foundation only — provider interfaces, no decision logic.
