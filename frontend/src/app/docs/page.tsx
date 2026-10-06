"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Search, 
  Copy, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface DocTopic {
  id: string;
  category: string;
  title: string;
}

const docTopics: DocTopic[] = [
  { id: "introduction", category: "Getting Started", title: "Introduction" },
  { id: "quickstart", category: "Getting Started", title: "Quickstart Guide" },
  { id: "comparison", category: "Getting Started", title: "Comparison & Benchmarks" },
  { id: "node-setup", category: "Installation", title: "Node.js Setup" },
  { id: "python-setup", category: "Installation", title: "Python FastAPI Setup" },
  { id: "configuration", category: "Installation", title: "Configuration & Env" },
  { id: "vanilla-sdk", category: "Client SDKs", title: "JavaScript / HTML SDK" },
  { id: "react-sdk", category: "Client SDKs", title: "React & Next.js" },
  { id: "backend-verify", category: "Backend Verification", title: "Server Verification (/api/siteverify)" },
  { id: "defense-pow", category: "Defense Mechanics", title: "Proof-of-Work (PoW)" },
  { id: "defense-jigsaw", category: "Defense Mechanics", title: "Anti-CV Jigsaw Slider" },
  { id: "defense-kinematics", category: "Defense Mechanics", title: "Biomechanical Kinematics" },
  { id: "api-reference", category: "API Reference", title: "REST API Endpoints" },
  { id: "production", category: "Production", title: "Production & Nginx Setup" },
];

export default function DocsPage() {
  const [activeTopic, setActiveTopic] = useState<string>("introduction");
  const [search, setSearch] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<"node" | "python" | "curl">("node");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const categories = Array.from(new Set(docTopics.map((t) => t.category)));

  const filteredTopics = docTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const currentIndex = docTopics.findIndex((t) => t.id === activeTopic);
  const prevTopic = currentIndex > 0 ? docTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < docTopics.length - 1 ? docTopics[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      <Navbar />

      {/* Clean Sub-Header (Standard Docs style) */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 sticky top-14 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Documentation</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-indigo-600 font-medium">
              {docTopics.find((t) => t.id === activeTopic)?.category}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">
              {docTopics.find((t) => t.id === activeTopic)?.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">
              v4.0.0
            </span>
            <Link
              href="/demo"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
            >
              Interactive Demo <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Docs Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Clean Left Navigation Sidebar */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-[#f8fafc] p-5 sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto hidden md:block">
          {/* Simple Search */}
          <div className="relative mb-5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>

          <nav className="flex flex-col gap-5 text-xs">
            {categories.map((cat) => {
              const topics = filteredTopics.filter((t) => t.category === cat);
              if (topics.length === 0) return null;

              return (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-2">
                    {cat}
                  </div>
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTopic(t.id)}
                      className={`text-left px-2.5 py-1.5 rounded-md transition-colors ${
                        activeTopic === t.id
                          ? "bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Article Content */}
        <main className="flex-1 p-6 md:p-10 max-w-3xl">
          
          {/* ================= 1. INTRODUCTION ================= */}
          {activeTopic === "introduction" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">ShieldCaptcha Enterprise v4.0</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                ShieldCaptcha is an enterprise bot defense engine designed to verify legitimate human interaction while preventing automated scripts, scrapers, and credential stuffing. It merges a <strong>1-Click Turnstile (PoW)</strong> with an <strong>Anti-Computer-Vision Jigsaw Puzzle</strong>.
              </p>

              <h2 className="text-base font-bold text-slate-900 mt-6 mb-2">Core Design Principles</h2>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-2 mb-6">
                <li><strong>Zero Dependencies:</strong> Operates entirely on standard runtime libraries without third-party npm packages or native C/C++ compilation.</li>
                <li><strong>Privacy First:</strong> Requires zero cross-site tracking cookies and stores zero personally identifiable information (PII).</li>
                <li><strong>Dual-Defense Paradigm:</strong> Automatically serves frictionless 1-click PoW for standard users, escalating suspicious traffic to an adversarial jigsaw puzzle.</li>
                <li><strong>Biomechanical Kinematics:</strong> Evaluates biological motion invariants (Flash & Hogan minimum-jerk theorem) to detect programmatic headless drivers.</li>
              </ul>

              <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 mb-6">
                <span className="font-semibold">System Architecture:</span> The client browser requests a challenge, solves the PoW or slider, submits proof to <code>/api/verify</code>, and receives an HMAC-signed single-use token that your backend validates via <code>/api/siteverify</code>.
              </div>
            </article>
          )}

          {/* ================= 2. QUICKSTART ================= */}
          {activeTopic === "quickstart" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Quickstart Guide</h1>
              <p className="text-sm text-slate-600 mb-6">
                Get ShieldCaptcha up and running on your login or registration form in 3 steps:
              </p>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">Step 1: Include the client script</h2>
              <p className="text-xs text-slate-500 mb-2">Add the lightweight script to your HTML document:</p>
              <div className="relative bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <code>{`<script src="https://shieldcaptcha.vercel.app/captcha.js"></script>`}</code>
                <button
                  onClick={() => handleCopy('<script src="https://shieldcaptcha.vercel.app/captcha.js"></script>', "qs1")}
                  className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  {copiedId === "qs1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">Step 2: Mount the widget container</h2>
              <p className="text-xs text-slate-500 mb-2">Place an empty container inside your form and mount the widget:</p>
              <div className="relative bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`<!-- HTML Form -->
<form id="auth-form">
  <input type="email" id="email" required />
  
  <div id="captcha-box"></div>
  
  <button type="submit" id="submit-btn" disabled>Sign In</button>
</form>

<script>
  let token = '';

  ShieldCaptcha.mount(document.getElementById('captcha-box'), {
    mode: 'checkbox', // 'checkbox' | 'jigsaw' | 'adaptive'
    onToken: (verifiedToken, meta) => {
      token = verifiedToken;
      document.getElementById('submit-btn').disabled = false;
    }
  });
</script>`}</pre>
                <button
                  onClick={() => handleCopy(`ShieldCaptcha.mount(document.getElementById('captcha-box'), { mode: 'checkbox', onToken: (t) => { ... } });`, "qs2")}
                  className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  {copiedId === "qs2" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">Step 3: Validate on your backend</h2>
              <p className="text-xs text-slate-500 mb-2">Verify the token with the ShieldCaptcha engine before granting access:</p>
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`const verifyRes = await fetch('https://shieldcaptcha.vercel.app/api/siteverify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Site-Secret': process.env.SITE_SECRET
  },
  body: JSON.stringify({ token: userToken })
});
const result = await verifyRes.json();
if (!result.success) {
  return res.status(403).json({ error: 'CAPTCHA verification failed' });
}`}</pre>
              </div>
            </article>
          )}

          {/* ================= 3. COMPARISON ================= */}
          {activeTopic === "comparison" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Comparison & Benchmarks</h1>
              <p className="text-sm text-slate-600 mb-6">
                Feature and performance comparison against mainstream commercial alternatives:
              </p>

              <div className="border border-slate-200 rounded-lg overflow-x-auto mb-6 bg-white shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3 text-indigo-700 font-bold">ShieldCaptcha v4.0</th>
                      <th className="p-3 text-slate-600">reCAPTCHA v3</th>
                      <th className="p-3 text-slate-600">Cloudflare Turnstile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Self-Hosted Hosting</td>
                      <td className="p-3 text-emerald-700 font-semibold">Yes (On-Premise)</td>
                      <td className="p-3 text-slate-500">No (Cloud only)</td>
                      <td className="p-3 text-slate-500">No (Cloud only)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">External Dependencies</td>
                      <td className="p-3 text-emerald-700 font-semibold">0 npm / 0 native</td>
                      <td className="p-3 text-slate-500">GStatic scripts</td>
                      <td className="p-3 text-slate-500">Cloudflare Edge</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Challenge Modalities</td>
                      <td className="p-3 text-emerald-700 font-semibold">PoW + Anti-CV Jigsaw</td>
                      <td className="p-3 text-slate-500">Score only</td>
                      <td className="p-3 text-slate-500">PoW only</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Kinematics Jerk Analysis</td>
                      <td className="p-3 text-emerald-700 font-semibold">Yes (d³x/dt³)</td>
                      <td className="p-3 text-slate-500">Opaque score</td>
                      <td className="p-3 text-slate-500">Telemetry</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Average Human Solve Time</td>
                      <td className="p-3 text-emerald-700 font-semibold">&lt; 20ms</td>
                      <td className="p-3 text-slate-500">Passive (~100ms)</td>
                      <td className="p-3 text-slate-500">Passive (~200ms)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* ================= 4. NODE SETUP ================= */}
          {activeTopic === "node-setup" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Node.js Engine Setup</h1>
              <p className="text-sm text-slate-600 mb-6">
                The Node.js server runs standalone using native Node.js APIs (crypto, http, zlib). It requires Node.js v18.0.0 or higher.
              </p>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">1. Start the Server</h2>
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-4">
                <pre>{`cd backend-node
node server.js`}</pre>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">2. Production PM2 Cluster</h2>
              <p className="text-xs text-slate-500 mb-2">To run in production across all CPU threads:</p>
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`npm install -g pm2
pm2 start server.js -i max --name "shield-captcha"`}</pre>
              </div>
            </article>
          )}

          {/* ================= 5. PYTHON SETUP ================= */}
          {activeTopic === "python-setup" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Python FastAPI Setup</h1>
              <p className="text-sm text-slate-600 mb-6">
                The Python engine provides an asynchronous ASGI alternative powered by FastAPI and Uvicorn.
              </p>

              <h2 className="text-sm font-bold text-slate-900 mt-6 mb-2">Install and Run</h2>
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`cd backend-python
pip install fastapi uvicorn pillow

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`}</pre>
              </div>
            </article>
          )}

          {/* ================= 6. CONFIGURATION ================= */}
          {activeTopic === "configuration" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Configuration & Environment Variables</h1>
              <p className="text-sm text-slate-600 mb-6">
                Both Node.js and Python engines recognize the following environment settings:
              </p>

              <div className="border border-slate-200 rounded-lg overflow-x-auto mb-6 bg-white shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
                    <tr>
                      <th className="p-3">Variable</th>
                      <th className="p-3">Default</th>
                      <th className="p-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="p-3 text-indigo-700 font-bold">PORT</td>
                      <td className="p-3 text-slate-500">3000</td>
                      <td className="p-3 font-sans">HTTP port for incoming traffic.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-indigo-700 font-bold">SITE_KEY</td>
                      <td className="p-3 text-slate-500">Auto-generated</td>
                      <td className="p-3 font-sans">Public identifier for frontend clients.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-indigo-700 font-bold">SITE_SECRET</td>
                      <td className="p-3 text-slate-500">Auto-generated</td>
                      <td className="p-3 font-sans">Secret header for <code>/api/siteverify</code>.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-indigo-700 font-bold">CAPTCHA_SECRET</td>
                      <td className="p-3 text-slate-500">Random 32-byte hex</td>
                      <td className="p-3 font-sans">Master signing key for HMAC-SHA256 tokens.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* ================= 7. CLIENT SDK VANILLA ================= */}
          {activeTopic === "vanilla-sdk" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">JavaScript / HTML SDK API</h1>
              <p className="text-sm text-slate-600 mb-6">
                The global <code>ShieldCaptcha</code> object mounts and manages the widget lifecycle:
              </p>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`const controller = ShieldCaptcha.mount(element, {
  mode: 'checkbox', // 'checkbox' | 'jigsaw' | 'adaptive'
  
  onToken: (token, meta) => {
    console.log('Token:', token);
    console.log('Trust score:', meta.score);
  },
  onReset: () => {
    console.log('Widget reset');
  }
});

// Runtime methods:
controller.switchMode('jigsaw'); // Switch mode on the fly
controller.reset();              // Reset state`}</pre>
              </div>
            </article>
          )}

          {/* ================= 8. CLIENT SDK REACT ================= */}
          {activeTopic === "react-sdk" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">React & Next.js Integration</h1>
              <p className="text-sm text-slate-600 mb-6">
                Embed the component in React 18/19 or Next.js App Router:
              </p>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`import { useState } from "react";
import { CaptchaWidget } from "@/components/CaptchaWidget";

export function AuthForm() {
  const [captchaToken, setCaptchaToken] = useState("");

  return (
    <form>
      <input type="email" placeholder="Account email" />
      
      <CaptchaWidget
        mode="checkbox"
        onToken={(t) => setCaptchaToken(t)}
        onReset={() => setCaptchaToken("")}
      />

      <button type="submit" disabled={!captchaToken}>
        Submit
      </button>
    </form>
  );
}`}</pre>
              </div>
            </article>
          )}

          {/* ================= 9. BACKEND VERIFICATION ================= */}
          {activeTopic === "backend-verify" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Server-Side Verification (/api/siteverify)</h1>
              <p className="text-sm text-slate-600 mb-6">
                Always verify the single-use token on your backend before granting access:
              </p>

              {/* Simple Tabs */}
              <div className="flex border-b border-slate-200 mb-4 gap-4 text-xs font-medium">
                <button
                  onClick={() => setCodeTab("node")}
                  className={`pb-2 transition-colors ${
                    codeTab === "node" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Node.js Express
                </button>
                <button
                  onClick={() => setCodeTab("python")}
                  className={`pb-2 transition-colors ${
                    codeTab === "python" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Python FastAPI
                </button>
                <button
                  onClick={() => setCodeTab("curl")}
                  className={`pb-2 transition-colors ${
                    codeTab === "curl" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  cURL
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                {codeTab === "node" && (
                  <pre>{`app.post('/api/login', async (req, res) => {
  const { email, captchaToken } = req.body;

  const verifyRes = await fetch('https://shieldcaptcha.vercel.app/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Secret': process.env.SITE_SECRET
    },
    body: JSON.stringify({ token: captchaToken, ip: req.ip })
  });

  const result = await verifyRes.json();
  if (!result.success) {
    return res.status(403).json({ error: 'CAPTCHA invalid or expired' });
  }

  return res.json({ success: true, score: result.trustScore });
});`}</pre>
                )}

                {codeTab === "python" && (
                  <pre>{`@app.post("/api/login")
async def login(payload: dict):
    token = payload.get("captchaToken")
    
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://shieldcaptcha.vercel.app/api/siteverify",
            headers={"X-Site-Secret": "sec_your_secret"},
            json={"token": token}
        )
        data = res.json()
        
    if not data.get("success"):
        raise HTTPException(status_code=403, detail="Invalid token")
        
    return {"status": "authenticated", "score": data.get("trustScore")}`}</pre>
                )}

                {codeTab === "curl" && (
                  <pre>{`curl -X POST https://shieldcaptcha.vercel.app/api/siteverify \\
  -H "Content-Type: application/json" \\
  -H "X-Site-Secret: sec_shield_secret" \\
  -d '{"token": "YOUR_CAPTCHA_TOKEN"}'`}</pre>
                )}
              </div>
            </article>
          )}

          {/* ================= 10. DEFENSE POW ================= */}
          {activeTopic === "defense-pow" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">1-Click Proof-of-Work (Turnstile Style)</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The 1-Click checkbox verifies human intention by combining an asymmetric computational problem with click kinematics:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-2 mb-6">
                <li><strong>Base 12-Bit SHA-256:</strong> Legit devices solve in 15–25ms in a background Web Worker without page lag.</li>
                <li><strong>Dynamic Rate Scaling:</strong> If an IP address generates excessive requests, difficulty dynamically scales up to 18 bits (262,144 hashes), neutralizing automated bot attacks.</li>
              </ul>
            </article>
          )}

          {/* ================= 11. DEFENSE JIGSAW ================= */}
          {activeTopic === "defense-jigsaw" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Anti-CV Jigsaw Slider</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Traditional puzzle captchas use predictable static stock images. ShieldCaptcha dynamically synthesizes adversarial Perlin noise with randomized tab contours, rendering automated edge detection and YOLO bounding box models ineffective.
              </p>
            </article>
          )}

          {/* ================= 12. DEFENSE KINEMATICS ================= */}
          {activeTopic === "defense-kinematics" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Biomechanical Kinematics</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Human cursor interaction adheres to biological minimum-jerk equations (Flash & Hogan):
              </p>
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-4">
                Jerk = Integral of ( (d³x/dt³)² + (d³y/dt³)² ) dt
              </div>
              <p className="text-xs text-slate-500">
                Robotic scripts generate linear constant velocity or discontinuous infinite jerk spikes, which are flagged and blocked.
              </p>
            </article>
          )}

          {/* ================= 13. API REFERENCE ================= */}
          {activeTopic === "api-reference" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">REST API Endpoints</h1>
              <p className="text-sm text-slate-600 mb-6">Standard JSON HTTP API reference:</p>

              <div className="space-y-4 text-xs">
                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                  <div className="font-mono font-bold text-indigo-700 mb-1">GET / POST /api/challenge</div>
                  <p className="text-slate-600 mb-2">Generates a challenge session and PoW prefix.</p>
                  <pre className="bg-[#0f172a] text-slate-200 p-2.5 rounded">{`Request:  { "mode": "checkbox" | "jigsaw" | "adaptive" }
Response: { "id": "...", "bits": 12, "prefix": "...", "token": "..." }`}</pre>
                </div>

                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                  <div className="font-mono font-bold text-emerald-700 mb-1">POST /api/verify</div>
                  <p className="text-slate-600 mb-2">Submits solution for kinematic & PoW evaluation.</p>
                  <pre className="bg-[#0f172a] text-slate-200 p-2.5 rounded">{`Response: { "ok": true, "token": "<HMAC-Token>", "score": 95 }`}</pre>
                </div>

                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                  <div className="font-mono font-bold text-sky-700 mb-1">POST /api/siteverify</div>
                  <p className="text-slate-600 mb-2">Backend verification endpoint. Validates single-use JTI token.</p>
                  <pre className="bg-[#0f172a] text-slate-200 p-2.5 rounded">{`Header:   X-Site-Secret: <YOUR_SECRET>
Body:     { "token": "<CAPTCHA_TOKEN>" }`}</pre>
                </div>
              </div>
            </article>
          )}

          {/* ================= 14. PRODUCTION ================= */}
          {activeTopic === "production" && (
            <article>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Production & Nginx Setup</h1>
              <p className="text-sm text-slate-600 mb-6">
                Recommended reverse proxy configuration for Nginx:
              </p>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 mb-6">
                <pre>{`server {
    listen 443 ssl http2;
    server_name captcha.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /captcha.js {
        proxy_pass http://127.0.0.1:3000;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }
}`}</pre>
              </div>
            </article>
          )}

          {/* Previous / Next Topic Navigation */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
            {prevTopic ? (
              <button
                onClick={() => setActiveTopic(prevTopic.id)}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{prevTopic.title}</span>
              </button>
            ) : <div />}

            {nextTopic && (
              <button
                onClick={() => setActiveTopic(nextTopic.id)}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 ml-auto"
              >
                <span>{nextTopic.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </main>
      </div>

      {/* Informative Simple English Footer */}
      <Footer />
    </div>
  );
}
