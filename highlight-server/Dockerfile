FROM golang:1.24-bookworm AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/highlightiq-api ./cmd/api

FROM debian:bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /out/highlightiq-api /usr/local/bin/highlightiq-api
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/highlightiq-api"]
