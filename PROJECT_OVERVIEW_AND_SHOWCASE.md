# ShieldCaptcha Enterprise — Master Project Showcase & Documentation

> **Self-Hostable, Zero-Cookie Autonomous Bot Defense & Cryptographic Human Verification Platform**  
> *Developed by Tushar Singh | Open-Source Security Architecture*

---

## 1. Executive Summary (Project Overview)

**ShieldCaptcha** ek next-generation, privacy-first bot defense platform hai jise modern web applications, APIs, aur login forms ko automated bot attacks, scraping, credential stuffing aur DDoS se bachane ke liye design kiya gaya hai.

Yeh traditional Google reCAPTCHA aur Cloudflare Turnstile ka ek **100% self-hostable aur open-source alternative** hai. Isme users se third-party cookies track nahi ki jaati aur na hi cross-site data collect kiya jaata hai. Yeh client-side **Cryptographic Proof-of-Work (PoW)**, **Biomechanical Kinematics Trajectory Analysis**, aur **HMAC-SHA256 Token Authorization** ke zariye sirf 150-300ms ke andar human verification complete karta hai.

---

## 2. Problem Statement (Yeh Project Kyun Banaya Gaya?)

| Problem (Legacy CAPTCHAs) | ShieldCaptcha Solution |
|---|---|
| **Privacy Violation:** Google reCAPTCHA users ka browsing history aur cookies track karta hai. | **Zero Cookies & GDPR Compliant:** ShieldCaptcha koi cookie ya personal tracking ID save nahi karta. |
| **Poor User Experience:** Users ko buses, traffic lights aur fire hydrants click karne me 15-30 second lagte hain. | **Sub-Second Verification:** 1-Click invisible checkbox ya smooth jigsaw puzzle (150-300ms execution). |
| **Vendor Lock-in & Costs:** Enterprise traffic par hazaron dollars ka bill aata hai (reCAPTCHA Enterprise). | **100% Free & Self-Hostable:** Zero licensing fee, Docker me apne server par host karein. |
| **Bypass by AI/OCR:** Vision AI models Google reCAPTCHA ke images ko aasaani se solve kar lete hain. | **Kinematics & PoW Defense:** Computer vision puzzle ke sath-sath mouse physics aur CPU compute check karta hai. |

---

## 3. Core Features & Capabilities

1. **Multi-Modal Verification Modes:**
   - **1-Click Proof-of-Work Checkbox:** Simple lightweight checkbox jo background Web Worker me leading-zero SHA-256 hash solve karta hai.
   - **Anti-Computer-Vision Jigsaw Puzzle:** Dynamic transparent puzzle jisme canvas noise aur edge distortion hoti hai taaki AI scrapers confuse ho sakein.
   - **Adaptive Threat Escalation:** Agar client suspicious lagta hai (fast requests, lack of human tremor), toh system automatically difficulty raise karta hai.

2. **Client-Side Proof-of-Work (PoW):**
   - SHA-256 algorithm par based dynamic mathematical puzzle.
   - Baseline difficulty (16 bits = ~65,000 hashes) normal mobile/laptop par 50-80ms me solve hoti hai.
   - Attackers ke liye difficulty automatically 22+ bits tak badh jaati hai, jisse unka CPU crash ho jaye.

3. **Biomechanical Kinematics Physics Engine:**
   - Insaan jab mouse move karta hai ya screen touch karta hai, toh usme natural micro-tremors (halke kaanpte hue points), acceleration curves, aur variable velocity hoti hai.
   - Script bots (Selenium, Puppeteer) seedha linear `(x, y)` move karte hain. ShieldCaptcha velocity derivatives aur curvature calculate karke bots ko turant block karta hai.

4. **Military-Grade Cryptographic Token Vault:**
   - Verification complete hone par backend ek single-use **HMAC-SHA256 Token** issue karta hai.
   - Token me `ipHash`, `timestamp`, `nonce`, aur `jti` embedded hote hain.
   - **Atomic Replay Protection:** Ek token sirf 1 baar use ho sakta hai aur 300 seconds baad expire ho jaata hai.

5. **Dual Core Engine Architecture:**
   - **Node.js Core Backend:** Zero-dependency, native HTTP & Crypto module par bana high-concurrency microservice.
   - **Python FastAPI Backend:** Data science aur enterprise Python ecosystems ke liye synchronized alternative engine.

6. **Interactive Developer Portal & Sandbox:**
   - Built with **Next.js 16 (Turbopack)**, **TypeScript**, aur **Tailwind CSS**.
   - Includes: Real-time Live Widget Playground, Kinematics Oscilloscope (visual mouse tremor graph), Attack Simulator (testing against bots), Token Claims Inspector, aur Documentation Hub.

---

## 4. How It Works (Step-by-Step Architecture Pipeline)

```
[User Browser / Client]
       │
       ├─► 1. Mounts Widget (<div id="shield-captcha">)
       ├─► 2. Web Worker executes SHA-256 Proof-of-Work puzzle
       ├─► 3. Records Mouse Pointer Kinematics & Device Fingerprint
       ├─► 4. Encrypts payload client-side via AES-CBC-128
       │
       ▼  POST /api/v1/challenge & /api/v1/verify
[ShieldCaptcha Core Defense Engine]
       │
       ├─► 5. Decrypts payload with session PBKDF2 key
       ├─► 6. Evaluates kinematic trajectory & hardware concurrency
       ├─► 7. Validates PoW solution & anti-replay nonces
       ├─► 8. Issues HMAC-SHA256 Signed Verification Token
       │
       ▼  Token passed to client application form
[Your Website Application Backend]
       │
       ▼  POST /api/v1/siteverify (Server-to-Server)
[ShieldCaptcha Engine] ──► Validates token authenticity ──► Returns { "success": true, "score": 98 }
```

---

## 5. Technology Stack & Frameworks

- **Frontend & Developer Portal:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Core Defense Engines:**
  - **Node.js:** Pure native `http` & `crypto` (Zero third-party dependencies for maximum security & speed)
  - **Python:** FastAPI, Uvicorn, Pydantic, Cryptography
- **Security & Cryptography:** SHA-256, HMAC-SHA256, AES-CBC-128, PBKDF2 Key Derivation, Web Workers API
- **DevOps, Infra & Production:** Docker, Docker Compose, NGINX Reverse Proxy, Vercel Serverless Edge, PM2, Systemd
- **Analytics & Observability:** Vercel Analytics, Vercel Speed Insights, Custom Telemetry Logs, SQLite/Memory token stores

---

## 6. Comparison Table (ShieldCaptcha vs Alternatives)

| Feature | ShieldCaptcha Enterprise | Google reCAPTCHA v2/v3 | Cloudflare Turnstile | hCaptcha |
|---|---|---|---|---|
| **Privacy / Cookie Tracking** | **Zero Cookies (100% Private)** | Third-party tracking cookies | Managed by Cloudflare | Cookies & telemetry |
| **Self-Hostable** | **Yes (Docker, Node, Python)** | No (Google Cloud only) | No (Cloudflare only) | No (Cloud only) |
| **Open Source** | **100% Open-Source (MIT)** | Closed-Source | Closed-Source | Partially closed |
| **Verification Latency** | **150ms – 300ms** | 2s – 15s (Grid images) | 300ms – 1s | 3s – 10s |
| **Enterprise Cost** | **Free Forever ($0)** | Paid after 10k assessments | Free tier / Enterprise | Paid enterprise tiers |
| **Proof-of-Work (PoW)** | **SHA-256 Hardware Adaptive** | No | Proprietary PoW | No |
| **Biomechanical Physics** | **Micro-tremor kinematics** | Proprietary behavioral | Browser environment | Image classification |

---

## 7. How To Integrate (Developer Integration Code)

### A. Frontend Integration (Vanilla HTML / JavaScript)
```html
<!-- 1. Include the client script -->
<script src="https://shieldcaptcha.vercel.app/captcha.js"></script>

<!-- 2. Form container -->
<form id="my-form" action="/login" method="POST">
  <input type="text" name="username" placeholder="Username" required />
  <input type="password" name="password" placeholder="Password" required />

  <!-- Captcha Widget Mount Point -->
  <div id="captcha-widget"></div>

  <button type="submit" id="submit-btn" disabled>Login</button>
</form>

<script>
  let verifiedToken = '';

  ShieldCaptcha.mount(document.getElementById('captcha-widget'), {
    siteKey: 'pub_shield_live_production_01928374',
    mode: 'checkbox', // or 'jigsaw'
    onSuccess: (token) => {
      verifiedToken = token;
      document.getElementById('submit-btn').disabled = false;
    }
  });
</script>
```

### B. Frontend Integration (React / Next.js)
```tsx
import { useState } from 'react';

export default function LoginForm() {
  const [token, setToken] = useState('');

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="email" placeholder="Email" required />
      
      {/* ShieldCaptcha Widget */}
      <div 
        id="shield-captcha" 
        data-sitekey="pub_shield_live_production_01928374"
        data-mode="checkbox"
      />

      <button type="submit" disabled={!token}>Submit</button>
    </form>
  );
}
```

### C. Backend Verification (Node.js / Express)
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username, password, captchaToken } = req.body;

  // Verify the token with ShieldCaptcha Server
  const verifyRes = await fetch('https://shieldcaptcha.vercel.app/api/v1/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Secret': process.env.SITE_SECRET // Your private secret
    },
    body: JSON.stringify({
      token: captchaToken,
      ip: req.ip
    })
  });

  const verification = await verifyRes.json();

  if (!verification.success) {
    return res.status(403).json({ error: 'Bot verification failed. Access denied.' });
  }

  // Continue authentication...
  res.json({ success: true, message: 'Welcome back human!' });
});
```

### D. Backend Verification (Python / FastAPI)
```python
import httpx
from fastapi import FastAPI, HTTPException, Request

app = FastAPI()

@app.post("/api/login")
async def login(request: Request, captcha_token: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://shieldcaptcha.vercel.app/api/v1/siteverify",
            headers={"X-Site-Secret": "your_private_site_secret"},
            json={"token": captcha_token, "ip": request.client.host}
        )
        data = resp.json()

    if not data.get("success"):
        raise HTTPException(status_code=403, detail="Bot challenge failed")

    return {"status": "authorized", "score": data.get("score")}
```

---

## 8. Live Links & Project Assets

- **Live Production URL:** [https://shieldcaptcha.vercel.app](https://shieldcaptcha.vercel.app)
- **Interactive Live Demo:** [https://shieldcaptcha.vercel.app/demo](https://shieldcaptcha.vercel.app/demo)
- **Attack Simulator Lab:** [https://shieldcaptcha.vercel.app/simulator](https://shieldcaptcha.vercel.app/simulator)
- **Architecture Specification:** [https://shieldcaptcha.vercel.app/architecture](https://shieldcaptcha.vercel.app/architecture)
- **Developer Documentation:** [https://shieldcaptcha.vercel.app/docs](https://shieldcaptcha.vercel.app/docs)
- **GitHub Repository:** [https://github.com/Tusharsinghoffical/ShieldCaptcha](https://github.com/Tusharsinghoffical/ShieldCaptcha)

---

## 9. Portfolio & Resume Ready Descriptions (Copy-Paste)

### A. One-Line Project Headline
> **ShieldCaptcha Enterprise** — Zero-cookie, self-hostable bot defense platform combining SHA-256 Proof-of-Work, mouse kinematics physics, and single-use HMAC token authorization.

### B. 30-Second Elevator Pitch
> *"I built ShieldCaptcha Enterprise to solve the major privacy and usability issues with Google reCAPTCHA and Cloudflare Turnstile. ShieldCaptcha is an open-source, zero-dependency bot mitigation system. It executes hardware-accelerated Proof-of-Work puzzles in background Web Workers and analyzes human mouse tremor kinematics in real-time, delivering sub-200ms verification with zero tracking cookies and 100% self-hostable Docker support."*

### C. Resume Bullet Points
- **Architected and deployed ShieldCaptcha**, an enterprise-grade bot defense platform eliminating third-party tracking cookies via client-side SHA-256 Proof-of-Work and biomechanical pointer trajectory analysis.
- **Engineered a zero-dependency Node.js core security engine** alongside a FastAPI microservice, implementing AES-CBC-128 payload encryption and atomic HMAC-SHA256 replay-protected verification tokens.
- **Built a Next.js 16 (Turbopack) developer portal** featuring interactive attack simulation labs, real-time kinematics oscilloscopes, and automated REST API verification gateways.
- **Deployed production infrastructure** on Vercel Edge CDN and Docker Compose with NGINX reverse proxy, achieving sub-200ms verification latency and 100% Lighthouse SEO scores.
