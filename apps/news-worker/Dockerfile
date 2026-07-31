# news-worker (Go) — multi-stage. Build context: this app directory.
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=build /bin/server /server
EXPOSE 4300
ENTRYPOINT ["/server"]
