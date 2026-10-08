# 🛡️ ShieldCaptcha Enterprise — Final Project Documentation

> **Self-Hostable, Zero-Cookie Autonomous Bot Defense & Cryptographic Human Verification Platform**  
> Proof-of-Work Web Worker • Biomechanical Kinematics • HMAC-SHA256 Token Vault • Dual Node/Python Engine

---

## 📌 Project Overview & Quick Reference Links

| Resource | Official URL / Destination |
| :--- | :--- |
| **💻 GitHub Source Code Repository** | [https://github.com/Tusharsinghoffical/ShieldCaptcha](https://github.com/Tusharsinghoffical/ShieldCaptcha) |
| **🌐 Live Developer Sandbox / Demo** | `http://localhost:3000` (Next.js 16 Portal) |
| **🤖 Companion Enterprise AI Platform (Saathi Bot)** | [https://saathi-bot.vercel.app](https://saathi-bot.vercel.app) • [GitHub](https://github.com/Tusharsinghoffical/Saathi-Bot) |
| **👨‍💻 Author Portfolio & Profile** | [https://codewithmrsingh.me/](https://codewithmrsingh.me/) (Tushar Singh) |
| **🚀 Container Registry & Deployment** | Docker & Docker Compose (`docker-compose.prod.yml`) |
| **📦 Core NPM Packages** | `@shieldcaptcha/core`, `@shieldcaptcha/widget`, `@shieldcaptcha/react` |

---

## 📖 Executive Summary

**ShieldCaptcha Enterprise** is an open-source, privacy-preserving, self-hostable bot defense and human verification platform engineered to replace Google reCAPTCHA, hCaptcha, and Cloudflare Turnstile.

Traditional CAPTCHAs track user browsing habits via third-party cookies, cost enterprise teams thousands of dollars per month, and are frequently defeated by OCR and Computer Vision AI models. 

ShieldCaptcha solves this by introducing:
1. **Zero Tracking Cookies (GDPR & DPDP Act Compliant)**: Preserves complete visitor anonymity.
2. **Client-Side Proof-of-Work (PoW)**: Solves dynamic leading-zero SHA-256 challenges in a background browser Web Worker.
3. **Biomechanical Kinematics Trajectory Physics**: Evaluates pointer curvature, jitter, acceleration derivatives, and micro-tremors to distinguish biological movement from automated headless scripts (Puppeteer, Playwright, Selenium).
4. **Single-Use Cryptographic HMAC-SHA256 Token Vault**: Guarantees atomic replay protection with 300-second expiration.
5. **Dual High-Throughput Engines**: Zero-dependency Node.js native engine alongside a Python FastAPI enterprise engine.

---

## 🏗️ Technical Architecture

```
[User Browser / Form]
       │
       ├──> 1. Solves Dynamic SHA-256 PoW in Web Worker
       ├──> 2. Captures Biomechanical Mouse/Touch Kinematics
       └──> 3. AES-CBC-128 Encrypted Payload sent to Engine
                    │
                    ▼
     [ShieldCaptcha Verification Engine (Node.js / FastAPI)]
       │
       ├──> Validates PoW Hash & Nonce
       ├──> Runs Kinematics Physics & Tremor Analysis
       └──> Issues Single-Use HMAC-SHA256 Authorization Token
                    │
                    ▼
     [Your Backend Server (/api/v1/siteverify)]
       │
       └──> Atomically Consumes Token & Authorizes Request
```

---

## ⚡ Core Tech Stack Matrix

| Layer | Technologies Used |
| :--- | :--- |
| **Developer Portal & Sandbox** | Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS |
| **Primary Node.js Engine** | Pure Node.js `node:http`, `node:crypto` (Zero External Dependencies) |
| **Alternative Python Engine** | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| **SDK & Widget Packages** | Vanilla TypeScript Web Component (<18KB), React Hook Wrapper |
| **Container & Ops** | Docker Multi-stage Builds, Docker Compose, Nginx Reverse Proxy, PM2 |

---

## 🏆 Project Author & Contact Details

- **Lead Developer & Security Architect**: Tushar Singh
- **GitHub Profile**: [@Tusharsinghoffical](https://github.com/Tusharsinghoffical)
- **Portfolio**: [https://codewithmrsingh.me/](https://codewithmrsingh.me/)
- **Repository**: [https://github.com/Tusharsinghoffical/ShieldCaptcha](https://github.com/Tusharsinghoffical/ShieldCaptcha)
- **License**: MIT License
