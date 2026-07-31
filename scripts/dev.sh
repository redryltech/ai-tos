#!/usr/bin/env bash
set -euo pipefail
# Start the local Phase 0 stack via Docker Compose.
cd "$(dirname "$0")/../infrastructure/docker"
docker compose up --build
