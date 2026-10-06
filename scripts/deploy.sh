#!/usr/bin/env bash

# =====================================================================
# ShieldCaptcha Enterprise - Automated Server Deployment Script
# Supports: Docker Compose (Standard or Production with NGINX)
# =====================================================================

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_NC='\033[0m' # No Color

echo -e "${COLOR_BLUE}=====================================================${COLOR_NC}"
echo -e "${COLOR_BLUE}  ShieldCaptcha Enterprise - Server Deployment${COLOR_NC}"
echo -e "${COLOR_BLUE}=====================================================${COLOR_NC}"


# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# 1. Check prerequisites
echo -e "\n${COLOR_BLUE}[1/5] Checking environment requirements...${COLOR_NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${COLOR_RED}[ERROR] Docker is not installed. Please install Docker first: https://docs.docker.com/engine/install/${COLOR_NC}"
    exit 1
fi

DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${COLOR_RED}[ERROR] Neither 'docker compose' nor 'docker-compose' found.${COLOR_NC}"
    exit 1
fi
echo -e "${COLOR_GREEN}[✓] Docker and Compose found: $($DOCKER_COMPOSE_CMD version)${COLOR_NC}"

# 2. Check and generate .env if missing
echo -e "\n${COLOR_BLUE}[2/5] Checking configuration (.env)...${COLOR_NC}"
if [ ! -f ".env" ]; then
    echo -e "${COLOR_YELLOW}[!] .env not found. Generating fresh cryptographic production keys...${COLOR_NC}"
    if command -v node &> /dev/null; then
        node scripts/generate-keys.js --write
    else
        echo -e "${COLOR_YELLOW}[!] Node not found on host. Copying .env.example to .env...${COLOR_NC}"
        cp .env.example .env
        RANDOM_CAPTCHA_SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s%N | sha256sum | head -c 64)
        RANDOM_SITE_SECRET="sec_shield_live_$(openssl rand -hex 16 2>/dev/null || date +%s%N | head -c 32)"
        sed -i "s/replace_with_64_character_hex_cryptographic_secret_key_here/${RANDOM_CAPTCHA_SECRET}/g" .env
        sed -i "s/sec_shield_live_production_99887766554433221100aabbccddeeff/${RANDOM_SITE_SECRET}/g" .env
    fi
    echo -e "${COLOR_GREEN}[✓] Production .env created.${COLOR_NC}"
else
    echo -e "${COLOR_GREEN}[✓] Existing .env file found.${COLOR_NC}"
fi

# 3. Determine deploy mode
COMPOSE_FILE="docker-compose.yml"
if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "\n${COLOR_BLUE}[3/5] Deploying in Production Mode with NGINX ($COMPOSE_FILE)...${COLOR_NC}"
    mkdir -p certbot/conf certbot/www nginx/conf.d
else
    echo -e "\n${COLOR_BLUE}[3/5] Deploying in Standard Mode ($COMPOSE_FILE)...${COLOR_NC}"
fi

# 4. Build and run containers
echo -e "\n${COLOR_BLUE}[4/5] Building and launching containers...${COLOR_NC}"
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d --build

# 5. Verification & Health Check
echo -e "\n${COLOR_BLUE}[5/5] Performing post-launch health checks...${COLOR_NC}"
echo -e "Waiting for services to report healthy..."

HEALTHY=0
for i in {1..15}; do
    BACKEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' shieldcaptcha-backend 2>/dev/null || echo "\"starting\"")
    FRONTEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' shieldcaptcha-frontend 2>/dev/null || echo "\"starting\"")
    
    echo -e "Check $i/15 - Backend: $BACKEND_STATUS | Frontend: $FRONTEND_STATUS"
    
    if [[ "$BACKEND_STATUS" == "\"healthy\"" ]] && [[ "$FRONTEND_STATUS" == "\"healthy\"" ]]; then
        HEALTHY=1
        break
    fi
    sleep 3
done

if [ $HEALTHY -eq 1 ]; then
    echo -e "\n${COLOR_GREEN}=====================================================${COLOR_NC}"
    echo -e "${COLOR_GREEN}  [SUCCESS] ShieldCaptcha Enterprise is Live!${COLOR_NC}"
    echo -e "${COLOR_GREEN}=====================================================${COLOR_NC}"
    if [ "$COMPOSE_FILE" == "docker-compose.prod.yml" ]; then
        echo -e "• Production Gateway (NGINX): http://localhost (Port 80/443)"
    else
        echo -e "• Frontend Portal:            http://localhost:3001"
        echo -e "• Defense Engine Backend:     https://shieldcaptcha.vercel.app"
    fi
    echo -e "• Healthcheck Endpoint:       https://shieldcaptcha.vercel.app/api/health"
    echo -e "=====================================================\n"
else
    echo -e "\n${COLOR_YELLOW}[WARNING] Containers are taking longer than usual to reach healthy status.${COLOR_NC}"
    echo -e "Check logs with: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f\n"
fi
