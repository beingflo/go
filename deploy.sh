#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

TAG="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
IMAGE="go:${TAG}"

echo "==> building ${IMAGE}"
podman build -t "$IMAGE" .

echo "==> transferring image to eos"
podman save "$IMAGE" | zstd -q | ssh eos 'zstd -q -d | podman load'

echo "==> deploying quadlet unit"
sed "s|__TAG__|${TAG}|g" go.container |
  ssh eos 'mkdir -p ~/.config/containers/systemd && cat > ~/.config/containers/systemd/go.container'

echo "==> restarting service"
ssh eos 'systemctl --user daemon-reload && systemctl --user restart go'

echo "==> verifying"
ssh eos 'systemctl --user is-active go'
ssh eos 'curl -sf -o /dev/null http://localhost:3001/' ||
  echo "WARN: health check failed — logs: ssh eos journalctl --user -u go"

echo "==> pruning old images (keeping 5 newest)"
ssh eos 'podman images --format "{{.Repository}}:{{.Tag}}" |
  grep -E "^localhost/go:" | sort | head -n -5 |
  xargs -r podman rmi >/dev/null 2>&1 || true'

echo "==> deploy of ${IMAGE} complete"
