# news-worker (Phase 0A)

Go service skeleton: health endpoint + event-consumer placeholder.

## Stack
Go 1.22 (stdlib only).

## Scripts
- `go run ./cmd/server` · `go build ./cmd/server`

## Health
`GET /health` on :4300.

## Configuration
`PORT` (default 4300).

## Notes
No news-engine logic. Skeleton for the News Intelligence Engine (later phase).
