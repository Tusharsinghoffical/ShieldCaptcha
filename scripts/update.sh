#!/usr/bin/env bash

# =====================================================================
# ShieldCaptcha Enterprise - Rolling Server Update Script
# Usage: ./scripts/update.sh [--prod]
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.yml"
if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "[1/3] Pulling latest code changes from Git..."
git pull origin main || git pull

echo "[2/3] Rebuilding updated images with zero-cache..."
docker compose -f "$COMPOSE_FILE" build

echo "[3/3] Performing rolling restart..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "[✓] ShieldCaptcha successfully updated to the latest revision!"
