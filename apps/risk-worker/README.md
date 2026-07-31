# risk-worker (Phase 0A)

Go service skeleton: health endpoint + event-consumer placeholder.

## Stack
Go 1.22 (stdlib only).

## Scripts
- `go run ./cmd/server` · `go build ./cmd/server`

## Health
`GET /health` on :4200.

## Configuration
`PORT` (default 4200).

## Notes
No risk-engine logic. Skeleton for the Risk Engine (later phase).
