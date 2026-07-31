# scheduler (Phase 0A)

Go service skeleton: health endpoint + scheduler loop placeholder.

## Stack
Go 1.22 (stdlib only).

## Scripts
- `go run ./cmd/server` · `go build ./cmd/server`

## Health
`GET /health` on :4400.

## Configuration
`PORT` (default 4400).

## Notes
No jobs wired. Skeleton for scheduled tasks (later phase).
