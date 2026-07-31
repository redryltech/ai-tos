#!/usr/bin/env bash
set -euo pipefail
# Fresh-clone bootstrap: install, lint, typecheck, migrate local DB.
corepack enable
pnpm install
pnpm run lint
pnpm run typecheck
pnpm --filter @ai-tos/database run migrate
echo "Bootstrap complete. Run 'make dev' to start services."
