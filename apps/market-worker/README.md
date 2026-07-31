# market-worker (Phase 0A)

Go service skeleton: health endpoint + event-consumer placeholder.

## Stack
Go 1.22 (stdlib only).

## Scripts
- `go run ./cmd/server` (dev) · `go build ./cmd/server` (prod binary)

## Health
`GET /health` on :4100.

## Configuration
`PORT` (default 4100).

## Notes
No broker/market logic. Skeleton ready for the Market Data Engine (later phase).
