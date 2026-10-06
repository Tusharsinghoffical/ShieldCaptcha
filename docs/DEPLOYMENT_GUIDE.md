# ShieldCaptcha Enterprise — Production Server Deployment Guide

This guide details how to deploy **ShieldCaptcha Enterprise** in production on any Linux/Unix server, cloud VPS (AWS EC2, DigitalOcean, Hetzner, Linode, GCP Compute Engine), container cluster, or platform-as-a-service.

---

## Architecture Overview

```
                      Internet Traffic (Clients & Bots)
                                    │
                                    ▼ [Ports 80 / 443]
                        ┌───────────────────────┐
                        │   NGINX Reverse Proxy │
                        │  (Rate Limiting & SSL)│
                        └───────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [Path: /api/*, /captcha.js]         [Path: /* (Web Portal)]
      ┌─────────────────────────────┐     ┌─────────────────────────────┐
      │   shieldcaptcha-backend     │     │   shieldcaptcha-frontend    │
      │   Zero-dependency Node.js   │     │   Next.js 16 Standalone     │
      │   Core Defense Engine       │     │   Developer Portal & Demos  │
      │   Port: 3000                │     │   Port: 3001                │
      └─────────────────────────────┘     └─────────────────────────────┘
```

The system comprises two core services:
1. **Core Defense Engine (`backend-node`)**: Fast, zero-dependency Node.js engine handling cryptographic Proof-of-Work, kinematic biomechanical scoring, and `/api/v1/siteverify`.
2. **Developer Portal & Demos (`frontend`)**: Next.js 16 + TypeScript web interface and API proxy layer.

---

## 1. Quick Start: Docker Compose (Recommended)

Docker Compose offers the simplest and most reproducible deployment method.

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) (>= 24.0)
- Docker Compose plugin (`docker compose`)

### Step 1: Clone Repository & Initialize Secrets

```bash
git clone https://github.com/Tusharsinghoffical/ShieldCaptcha.git
cd ShieldCaptcha

# Generate secure cryptographic keys and initialize .env
node scripts/generate-keys.js --write
```

*(If Node.js is not installed on the host, copy `.env.example` to `.env` and configure random secrets manually).*

### Step 2: Launch Containers

```bash
# Standard Stack (Backend on :3000, Frontend on :3001)
docker compose up -d --build
```

### Step 3: Verify Status

```bash
# Check container status
docker compose ps

# Check engine healthcheck
curl https://shieldcaptcha.vercel.app/api/health
```

Both containers will automatically restart on system reboot (`restart: unless-stopped`).

---

## 2. Production Stack with NGINX & SSL (Ports 80 & 443)

For live domain deployments, run the preconfigured production stack with NGINX edge routing:

```bash
# 1. Start the production stack
docker compose -f docker-compose.prod.yml up -d --build
```

### Configuring SSL with Let's Encrypt / Certbot

1. Update `server_name` in [nginx/conf.d/default.conf](../nginx/conf.d/default.conf) to your public domain (e.g., `captcha.example.com`).
2. Run Certbot to obtain free SSL certificates:

```bash
docker run -it --rm --name certbot \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d captcha.example.com --email admin@example.com --agree-tos --no-eff-email
```

3. Uncomment the SSL block at the bottom of [nginx/conf.d/default.conf](../nginx/conf.d/default.conf) and reload NGINX:

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 3. Bare-Metal / Linux VPS Deployment (PM2 & NGINX)

If you prefer deploying directly on Ubuntu 22.04/24.04 without Docker:

### Step 1: Install Node.js 20 LTS & PM2

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2 process manager globally
sudo npm install -g pm2
```

### Step 2: Clone and Build Application

```bash
cd /var/www
sudo git clone https://github.com/Tusharsinghoffical/ShieldCaptcha.git shieldcaptcha
cd shieldcaptcha

# Install dependencies and build Next.js
npm install
npm run build

# Generate production environment
node scripts/generate-keys.js --write
```

### Step 3: Start Services with PM2

The repository includes a tuned [ecosystem.config.js](../ecosystem.config.js):

```bash
# Start both backend and frontend under PM2 supervision
pm2 start ecosystem.config.js --env production

# Ensure PM2 starts automatically on system reboot
pm2 save
pm2 startup
```

### Step 4: Alternative — Systemd Service Units

If your infrastructure relies on systemd instead of PM2:

```bash
# Copy systemd unit templates
sudo cp systemd/shieldcaptcha-backend.service /etc/systemd/system/
sudo cp systemd/shieldcaptcha-frontend.service /etc/systemd/system/

# Reload systemd and start services
sudo systemctl daemon-reload
sudo systemctl enable --now shieldcaptcha-backend
sudo systemctl enable --now shieldcaptcha-frontend

# Inspect service logs
sudo journalctl -u shieldcaptcha-backend -f
```

---

## 4. Cloud Platform Deployments

### Vercel (Edge / Serverless Frontend)

1. Connect your repository to Vercel.
2. The project contains a preconfigured [vercel.json](../vercel.json).
3. If proxying to a dedicated backend, set `CAPTCHA_BACKEND_URL` in Vercel project environment variables (e.g. `https://engine.example.com`). If left blank, the frontend's built-in serverless fallback engine handles verification automatically!

### Railway / Render / Fly.io

- **Backend**: Point to root with Dockerfile `backend-node/Dockerfile`, or build command `node backend-node/server.js`, listening on `PORT=3000`.
- **Frontend**: Point to root with Dockerfile `frontend/Dockerfile`, set environment variable `CAPTCHA_BACKEND_URL` to your backend internal/public URL.

---

## 5. Security & Hardening Checklist

| Item | Requirement | Checked |
|---|---|---|
| **Cryptographic Secrets** | Ensure `CAPTCHA_SECRET`, `SITE_SECRET`, and `HEALTH_CHECK_SECRET` are unique 64-character random hex strings. Never use defaults in production. | [ ] |
| **Reverse Proxy Header** | When behind NGINX, Cloudflare, or AWS ALB, set `TRUST_PROXY=true` in `.env` so client IP hashes and rate limits bind to actual visitor IPs. | [ ] |
| **Firewall (UFW)** | Allow only ports `80`, `443`, and `22` (SSH). Never expose port `3000` or `3001` directly to the public internet without a reverse proxy. | [ ] |
| **Rate Limiting** | NGINX configuration includes burst-protected rate limiting on `/api/challenge` and `/api/verify` (30 req/sec per IP). | [ ] |
| **Automated Updates** | Use `./scripts/update.sh` to pull latest changes and perform rolling rebuilds with zero downtime. | [ ] |

### Recommended Firewall Setup (Ubuntu UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 6. Diagnostic & Health Monitoring

Verify real-time engine health and threat telemetry at any time:

```bash
# Basic Health Status
curl -i https://shieldcaptcha.vercel.app/api/health

# Deep Diagnostics (requires HEALTH_CHECK_SECRET from .env)
curl "https://shieldcaptcha.vercel.app/api/health?key=YOUR_HEALTH_CHECK_SECRET&deep=true"

# Live Threat Analytics & Active Challenge Counter
curl https://shieldcaptcha.vercel.app/api/stats
```
