# AI-TOS — developer entrypoint. One command to a running platform.
SHELL := /bin/bash
export COMPOSE_PROJECT_NAME := ai-tos

.PHONY: bootstrap install build dev lint test typecheck format db-migrate db-seed terraform-init help

help:
	@echo "AI-TOS Phase 0"
	@echo "  make bootstrap     Install deps, lint, typecheck (fresh clone)"
	@echo "  make dev           Start all services via Docker Compose"
	@echo "  make build         Build every workspace (turbo)"
	@echo "  make test          Run tests (turbo)"
	@echo "  make db-migrate    Run database migrations locally"
	@echo "  make terraform-init   terraform init (infra)"

bootstrap:
	pnpm install
	pnpm run lint
	pnpm run typecheck

install:
	pnpm install

build:
	pnpm run build

dev:
	docker compose -f infrastructure/docker/docker-compose.yml up --build

lint:
	pnpm run lint

test:
	pnpm run test

typecheck:
	pnpm run typecheck

format:
	pnpm run format

db-migrate:
	pnpm --filter @ai-tos/database run migrate

db-seed:
	pnpm --filter @ai-tos/database run seed

terraform-init:
	cd infrastructure/terraform && terraform init
