# 🛡️ ShieldCaptcha Enterprise v4.0 (Unified Dual-Defense Engine)

> **Ultra-Secure, Frictionless Bot Defense & Authorization Engine**  
> Combines seamless **1-Click Proof-of-Work (Turnstile style)** with an **Anti-Computer-Vision Interlocking Jigsaw Slider (Arkose style)** and automated **Step-Up Threat Escalation**.

---

## ⚡ Highlights

* **Zero External Dependencies:** Built entirely with Node.js built-ins (`http`, `crypto`, `fs`, `zlib`). No external npm packages required!
* **Dual Defense Architecture:**
  1. **1-Click Turnstile Mode:** Instant 18ms human approval via background SHA-256 Web Worker Proof-of-Work and ambient pointer entropy.
  2. **Magnetic Jigsaw Slider Mode:** Anti-CV procedural image synthesis with high-contrast glowing socket cutout, generous magnetic snap tolerance (`±24px`), and Flash & Hogan minimum-jerk kinematics.
  3. **Adaptive Step-Up Mode:** Real humans click once to pass. If headless browsers or automation scripts attack, the system seamlessly escalates to the visual puzzle!
* **Enterprise Authorization:** Cryptographically signed HMAC-SHA256 tokens with atomic single-use (`jti`) consumption and IP binding.
* **Dual Backend Support:** Production-ready **Node.js** engine + synchronized **Python (FastAPI)** engine.

---

## 📂 Enterprise Project Structure

```
ShieldCaptcha/
├── 📁 frontend/                 # ⚡ Next.js 16 + TypeScript + Tailwind v4 Developer Portal
│   ├── src/
│   │   ├── app/                # App Router (page.tsx, layout.tsx, /api/* proxy)
│   │   ├── components/         # Modern UI (Oscilloscope, Bot Lab, Integration Hub, etc.)
│   │   └── lib/                # Backend proxy & utilities
│   ├── public/                 # Static assets (logo.png)
│   └── package.json            # Next.js, Framer Motion, Lucide, Canvas Confetti
│
├── 📁 backend-node/             # 🛡️ High-Performance Node.js Core Enterprise Engine
│   ├── server.js               # Zero-dependency HTTP/crypto/zlib CAPTCHA engine
│   ├── package.json            # Node backend scripts
│   └── public/                 # Standalone static portal & client assets (index.html, logo.png)
│
├── 📁 backend-python/           # 🐍 Synchronized Python (FastAPI) Backend Engine
│   ├── captcha_server.py       # FastAPI high-speed verification engine
│   └── requirements.txt        # Minimal dependencies (fastapi, uvicorn)
│
├── 📁 sdk/                      # 📦 Client SDK & Embed Kit
│   ├── captcha.js              # Universal client SDK (works in any vanilla/React/Vue app)
│   ├── demo.html               # 1-File minimal drop-in verification demo
│   └── logo.png                # Official high-resolution glowing shield emblem
│
├── 📁 docs/                     # 📚 Enterprise Documentation & References
│   ├── INTEGRATION_GUIDE.md    # Multi-language integration guides (HTML, React, Node, Python, PHP, Go)
│   └── API_REFERENCE.md        # Complete REST API specifications & cryptographic details
│
├── 🚀 start-all.bat             # 🌟 1-Click Master Launcher (starts Backend & Frontend, opens browser)
├── ⚙️ start-backend-node.bat    # 1-Click Node.js engine launcher (:3000)
├── ⚙️ start-backend-python.bat  # 1-Click Python FastAPI engine launcher (:8000)
├── ⚙️ start-frontend.bat        # 1-Click Next.js frontend launcher (:3001)
├── 📦 package.json              # Monorepo root scripts (`npm run dev`, `npm run build`)
└── 📄 README.md                 # Master project documentation
```

---

## 🚀 Quickstart (How to Run)

### 🌟 Option 1: 1-Click Master Launcher (Recommended)
Simply double-click:
```cmd
start-all.bat
```
This automatically boots the **Node.js Engine** (:3000), starts the **Next.js 16 Portal** (:3001), and opens your default browser directly to `http://localhost:3001`!

---

### 💻 Option 2: Terminal / NPM Monorepo Scripts

#### Run Both Frontend & Backend:
```bash
# Terminal 1: Start Backend Engine (Port 3000)
npm run dev:backend

# Terminal 2: Start Next.js 16 Frontend (Port 3001)
npm run dev
```

Open your browser:
* 🌐 **Frontend Enterprise Portal:** [http://localhost:3001](http://localhost:3001)
* ⚡ **Node.js Backend Engine:** [http://localhost:3000](http://localhost:3000)
* 🧩 **Minimal 1-File Embed Demo:** [http://localhost:3000/demo.html](http://localhost:3000/demo.html)

---

### 🐍 Option 3: Python (FastAPI) Engine
Double-click `start-backend-python.bat` or run:
```bash
cd backend-python
pip install -r requirements.txt
python -m uvicorn captcha_server:app --port 8000 --reload
```

---

## 🎯 How to Test the Live Trial

1. Open **`http://localhost:3000`** in any browser.
2. **Test 1-Click Turnstile:** Click "Verify you are human". It runs background bit-level SHA-256 PoW in a Web Worker and confirms with a green checkmark instantly!
3. **Test Magnetic Jigsaw Puzzle:** Switch to the "🧩 Jigsaw (Magnetic)" pill. Slide the knob towards the glowing cutout slot. It aligns smoothly with generous tolerance!
4. **Test Attack Simulator:** Switch to the "Attack Simulator" tab on the right and launch simulated attacks (Linear Script, Teleport, Synthetic Bezier, Headless Chrome) to watch the engine block each exploit with live audit reasons.
5. **Add to Your Project:** Scroll to the "Add to Your Project" section to copy-paste ready-to-run frontend and backend code in your preferred language.

---

## 🔑 Environment Configuration

You can customize secret keys and ports via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `SITE_KEY` | Auto-generated | Public client identifier |
| `SITE_SECRET` | Auto-generated | Private key for `/api/siteverify` |
| `CAPTCHA_SECRET`| Auto-generated | HMAC key for signing tokens |

---

## 📄 License
MIT License. Free for enterprise and personal integration.
