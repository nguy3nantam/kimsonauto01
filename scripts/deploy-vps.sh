#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

compose_file="compose.production.yml"
image_ref="${IMAGE_REF:-ghcr.io/nguy3nantam/kimsonauto01:latest}"
host_port="${HOST_PORT:-3001}"

export IMAGE_REF="$image_ref"
export HOST_PORT="$host_port"

echo "Pulling $image_ref"
docker compose -f "$compose_file" pull
docker compose -f "$compose_file" up -d --remove-orphans --wait --wait-timeout 120

health_url="http://127.0.0.1:${host_port}/api/health"
docker exec kimsonauto node -e "fetch('http://127.0.0.1:3000/api/health').then(async response => { const body = await response.json(); if (!response.ok || body.status !== 'ok') process.exit(1); console.log(JSON.stringify(body)); }).catch(() => process.exit(1))"

docker compose -f "$compose_file" ps
echo "Deployment healthy at $health_url"
