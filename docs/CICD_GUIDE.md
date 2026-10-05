# ShieldCaptcha Enterprise — CI/CD & GitHub Actions Automation Guide

ShieldCaptcha Enterprise includes a battle-tested Continuous Integration & Continuous Deployment (CI/CD) pipeline built with GitHub Actions.

---

## 1. Pipeline Architecture

```
Push / PR to main
       │
       ▼
 ┌──────────────────────────────────────────────┐
 │ CI: Lint, Typecheck & Container Build Checks │
 │ (.github/workflows/ci.yml)                   │
 └──────────────────────┬───────────────────────┘
                        │
                        ▼ (On push to main)
 ┌──────────────────────────────────────────────┐
 │ CD: Container Registry & Server Deployment   │
 │ (.github/workflows/cd.yml)                   │
 └──────────────┬───────────────────────────────┘
                │
                ├──► Build & Push to GitHub Container Registry (ghcr.io)
                │
                └──► SSH Deploy to Remote VPS Server
                      ├── git fetch & reset to latest origin/main
                      ├── Auto-generates cryptographic keys (.env)
                      ├── Rolling zero-downtime container update
                      └── Post-launch healthcheck validation (/api/health)
```

---

## 2. Workflows Included

### 1. `ci.yml` (Continuous Integration)
- **Triggers**: On push or PR to `main`, `master`, or `develop`.
- **Jobs**:
  1. `lint-and-typecheck`: Validates TypeScript typing and verifies that `next build` passes with zero errors. Runs backend engine syntax and health checks.
  2. `docker-build-verification`: Tests building both frontend and backend Docker images using GitHub Actions caching (`type=gha`) for ultra-fast runtimes (~40 seconds).

### 2. `cd.yml` (Continuous Deployment)
- **Triggers**: On merge/push to `main`, or manually via GitHub's **Run workflow** button (`workflow_dispatch`).
- **Jobs**:
  1. `publish-containers`: Builds production Docker images and publishes them to the GitHub Container Registry (`ghcr.io`).
  2. `deploy-to-server`: Automatically connects to your remote Linux server via SSH, pulls the latest code, and runs a zero-downtime update using Docker Compose or PM2.

---

## 3. Configuring Auto-Deploy to Your Server

To enable automatic deployment whenever you push changes, configure the following secrets in your GitHub repository:

1. Navigate to your repository on GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** and add:

| Secret Name | Required | Description | Example |
|---|---|---|---|
| `SERVER_HOST` | **Yes** | Public IP address or domain of your VPS | `198.51.100.25` or `captcha.example.com` |
| `SERVER_USER` | **Yes** | SSH user with sudo/docker permissions | `root` or `ubuntu` |
| `SSH_PRIVATE_KEY` | **Yes** | Your private SSH key (`id_ed25519` or `id_rsa`) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | No | SSH port (defaults to `22`) | `22` |
| `DEPLOY_PATH` | No | Absolute folder path on the server | `/var/www/shieldcaptcha` |

> [!NOTE]
> If `SERVER_HOST` and `SSH_PRIVATE_KEY` are not set, the workflow will safely build and publish your container images to GHCR and skip the SSH step without failing.

---

## 4. Manual Deployment via GitHub Actions UI

You can trigger a deployment anytime directly from GitHub:
1. Go to the **Actions** tab in your repository.
2. Select **CD - Automated Production Server Deployment** from the left sidebar.
3. Click **Run workflow**, choose your branch, select your deployment mode:
   - `docker-compose-prod` (Nginx + Backend + Frontend on ports 80/443)
   - `docker-compose-standard` (Backend on 3000, Frontend on 3001)
   - `pm2-rolling-update` (Native Node.js VPS deployment)
4. Click **Run workflow**.

---

## 5. Setting up Deploy Keys on Your Server (One-Time Setup)

On your Ubuntu/Debian server:

```bash
# 1. Create a dedicated deploy key (press Enter to accept defaults)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# 2. Add the public key to authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. Copy the private key content and paste it into GitHub Repository Secrets (SSH_PRIVATE_KEY)
cat ~/.ssh/github_deploy
```
