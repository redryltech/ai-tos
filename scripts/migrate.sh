#!/usr/bin/env bash
set -euo pipefail
pnpm --filter @ai-tos/database run migrate
