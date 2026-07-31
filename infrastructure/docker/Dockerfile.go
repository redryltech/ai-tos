# Generic Go worker builder. Pass WORKER=<market-worker|risk-worker|news-worker|scheduler>.
ARG WORKER=market-worker
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY apps/${WORKER}/go.mod ./
COPY apps/${WORKER} ./
RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=build /bin/server /server
EXPOSE 4100
ENTRYPOINT ["/server"]
