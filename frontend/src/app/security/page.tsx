import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Policy — ShieldCaptcha Enterprise",
  description: "ShieldCaptcha security architecture, cryptographic design, responsible disclosure, and vulnerability reporting.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Security
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Security Policy</h1>
          <p className="text-slate-500 text-sm">
            <strong>Last updated:</strong> October 4, 2026 &nbsp;·&nbsp;
            <strong>Version:</strong> v4.1-hardened
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            ShieldCaptcha v4.1 is built on a layered defense architecture. This page documents the
            cryptographic design, threat model, and responsible disclosure process.
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-700 leading-relaxed">

          {/* Security Architecture */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-5">Defense Layers</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  layer: "L1 — Proof-of-Work (PoW)",
                  desc: "Every challenge requires solving a SHA-256 leading-zero PoW. Baseline: 16 bits (~65,000 hashes). Adaptive ceiling: 22 bits (~4M hashes) for flagged IPs. Solved via Web Worker in <50ms for real browsers.",
                  badge: "SHA-256",
                  color: "indigo",
                },
                {
                  layer: "L2 — AES-CBC-128 Payload Encryption",
                  desc: "All telemetry is encrypted before transmission using AES-CBC-128 with a PBKDF2-derived key (1,000 iterations, SHA-256) and a random 16-byte IV. The server decrypts using Node.js `crypto` with the session salt.",
                  badge: "AES-CBC",
                  color: "violet",
                },
                {
                  layer: "L3 — Biomechanical Kinematics",
                  desc: "Jigsaw mode captures up to 800 pointer trajectory points and analyzes velocity coefficient-of-variation, physiological Y-axis tremor (stdDev), directional reversals, and Fitts' Law deceleration profile.",
                  badge: "Kinematics",
                  color: "sky",
                },
                {
                  layer: "L4 — Deep Browser Fingerprinting",
                  desc: "WebGL renderer (software renderer detection), canvas pixel fingerprint, audio context fingerprint, screen entropy, hardware concurrency, navigator.plugins, and native API tamper detection (toString check on setTimeout, fetch, etc.).",
                  badge: "Fingerprint",
                  color: "emerald",
                },
                {
                  layer: "L5 — Interaction Timing Analysis",
                  desc: "Tracks time-on-page before solve, total interaction count, synthetic event ratio (isTrusted=false events), focus-loss count, and scroll depth. Server scores and applies penalty to final trust score.",
                  badge: "Timing",
                  color: "amber",
                },
                {
                  layer: "L6 — Honeypot & Event Trust Checks",
                  desc: "An invisible off-screen form field captures automated form-fillers. All pointer events are checked for isTrusted=false (dispatched events), which are hard-rejected before PoW even starts.",
                  badge: "Honeypot",
                  color: "rose",
                },
                {
                  layer: "L7 — IP Rate Limiting & Progressive Lockout",
                  desc: "Leaky-bucket rate limiter: 50 tokens/minute per IP. After 8 consecutive failures, IP is locked for 10 minutes. PoW difficulty automatically increases with each consecutive fail from the same IP.",
                  badge: "Rate Limit",
                  color: "orange",
                },
                {
                  layer: "L8 — Anti-Replay (Trajectory Hash)",
                  desc: "SHA-256 hash of each submitted trajectory is stored in memory for 10 minutes. Identical trajectories are rejected as replay attacks. Hash set is garbage-collected automatically.",
                  badge: "Anti-Replay",
                  color: "teal",
                },
              ].map(({ layer, desc, badge, color }) => (
                <div key={layer} className={`p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-4`}>
                  <div className={`flex-shrink-0 px-2 py-1 rounded-md bg-${color}-100 border border-${color}-200 text-${color}-800 text-[10px] font-bold self-start`}>
                    {badge}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{layer}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HTTP Security Headers */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">HTTP Security Headers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Header</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
                    ["Content-Security-Policy", "default-src 'none' (API responses)"],
                    ["X-Content-Type-Options", "nosniff"],
                    ["X-Frame-Options", "DENY"],
                    ["X-XSS-Protection", "1; mode=block"],
                    ["Referrer-Policy", "strict-origin-when-cross-origin"],
                    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
                    ["Cache-Control", "no-store, no-cache, must-revalidate, private"],
                  ].map(([h, v]) => (
                    <tr key={h} className="even:bg-slate-50">
                      <td className="px-3 py-2 border border-slate-200 font-mono text-indigo-700 font-medium">{h}</td>
                      <td className="px-3 py-2 border border-slate-200 text-slate-600 font-mono">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Token Structure */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Verification Token Structure</h2>
            <p>Tokens are HMAC-SHA256 signed (base64url body + signature), single-use, expiring in 2 minutes:</p>
            <pre className="mt-3 p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs overflow-x-auto font-mono leading-relaxed">{`{
  "jti": "<random 128-bit ID — prevents reuse>",
  "cid": "<challenge session ID>",
  "sub": "<HMAC-hashed IP — no raw IP stored>",
  "aud": "<site key>",
  "scope": "captcha:authorized",
  "mode": "jigsaw_kinematics | checkbox_pow",
  "score": 0–100,
  "iat": <issued timestamp ms>,
  "exp": <expiry timestamp ms — iat + 120000>
}`}</pre>
          </section>

          {/* Responsible Disclosure */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Responsible Disclosure</h2>
            <p>
              If you discover a security vulnerability in ShieldCaptcha, please report it privately before
              public disclosure. We follow a <strong>90-day disclosure timeline</strong>.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
              <strong>Report to:</strong>{" "}
              <a href="mailto:security@shieldcaptcha.dev" className="text-emerald-700 hover:underline font-mono">
                security@shieldcaptcha.dev
              </a>
              <br />
              <strong>PGP:</strong> Available on request<br />
              <strong>Response SLA:</strong> 48 hours acknowledgement, 14 days triage, 90 days fix
            </div>
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Please do not</strong> open public GitHub issues for security vulnerabilities. Private
              disclosure protects users while a fix is developed.
            </div>
          </section>

          {/* Threat Model */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Threat Model — What We Defend Against</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Headless browsers (Puppeteer, Playwright, Selenium)", status: "defended" },
                { label: "Programmatic click bots (isTrusted=false)", status: "defended" },
                { label: "Linear / teleport drag automation", status: "defended" },
                { label: "Computer-vision puzzle solvers", status: "defended" },
                { label: "WebDriver-controlled browsers", status: "defended" },
                { label: "Virtual machine / software-rendered GPU", status: "defended" },
                { label: "Trajectory replay attacks", status: "defended" },
                { label: "Burst / DDoS attempts (rate limiting)", status: "defended" },
                { label: "Advanced human-in-the-loop farms", status: "mitigated" },
                { label: "AI-generated biomechanical trajectories", status: "mitigated" },
                { label: "Physical nation-state adversaries", status: "out-of-scope" },
              ].map(({ label, status }) => (
                <div
                  key={label}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 ${
                    status === "defended"
                      ? "bg-emerald-50/70 border-emerald-200/70 text-emerald-800"
                      : status === "mitigated"
                      ? "bg-amber-50/70 border-amber-200/70 text-amber-800"
                      : "bg-rose-50/70 border-rose-200/70 text-rose-800"
                  }`}
                >
                  {status === "defended" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  {status === "mitigated" && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                  {status === "out-of-scope" && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
