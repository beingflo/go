FROM node:23-bookworm AS ui-builder
WORKDIR /usr/src/go/ui
RUN apt update && apt install -y python3 libsdl-pango-dev brotli gzip
ENV TZ="Europe/Zurich"

COPY ui/package.json ui/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/src/rest-quest/ui/node_modules \
    npm install
COPY ./ui/ ./
RUN --mount=type=cache,target=/usr/src/rest-quest/ui/node_modules \
    npm run build

# Compress static assets
RUN find dist -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" \) \
  -exec gzip -9 -k {} \; \
  -exec brotli -q 11 -k {} \;

FROM rust:bookworm AS builder
WORKDIR /usr/src/go/service
COPY ./service .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/usr/src/go/service/target \
    cargo build --release --bin go \
    && cp target/release/go /go

FROM debian:bookworm-slim AS runtime
WORKDIR /usr/src/app/
COPY --from=builder /go /usr/src/app/go
COPY --from=ui-builder /usr/src/go/ui/dist ./ui
ENTRYPOINT ["/usr/src/app/go"]
