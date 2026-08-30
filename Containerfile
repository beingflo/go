FROM node:23-bookworm AS ui-builder
WORKDIR /usr/src/rest-quest/ui
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
WORKDIR /usr/src/rest-quest/service
COPY ./service .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/usr/src/rest-quest/service/target \
    cargo build --release --bin rest-quest \
    && cp target/release/rest-quest /rest-quest

FROM debian:bookworm-slim AS runtime
WORKDIR /usr/src/app/
COPY --from=builder /rest-quest /usr/src/app/rest-quest
COPY --from=ui-builder /usr/src/rest-quest/ui/dist ./ui
ENTRYPOINT ["/usr/src/app/rest-quest"]
