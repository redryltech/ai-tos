# AI-TOS AI Service (Python/FastAPI) — multi-stage. Build context: repository root.
FROM python:3.11-slim AS build
WORKDIR /app
COPY apps/ai-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/ai-service/app ./app

FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=build /app /app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
