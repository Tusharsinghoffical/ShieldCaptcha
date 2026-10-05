import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShieldCaptcha handles your data: zero tracking cookies, no personal data storage, fully GDPR-ready.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Legal Document
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">
            <strong>Last updated:</strong> October 4, 2026 &nbsp;·&nbsp;
            <strong>Version:</strong> 1.0
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            ShieldCaptcha is built on a <strong>privacy-first principle</strong>. We do not sell, rent, or share
            your personal data with third parties for advertising. This policy explains exactly what data is
            collected, why, and how it is protected.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-sm text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">1. Who We Are</h2>
            <p>
              ShieldCaptcha is an open-source bot-defense system. The software is self-hosted — when you deploy
              ShieldCaptcha, <strong>you are the data controller</strong>. The ShieldCaptcha project itself does not
              receive any data from your deployment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">2. What Data Is Collected</h2>
            <p>ShieldCaptcha collects the minimum data necessary to distinguish humans from bots:</p>
            <ul className="list-none space-y-3 mt-3">
              {[
                ["Mouse / pointer trajectory", "Short-lived kinematics data during the drag gesture. Stored only in memory for the duration of a single verification session (~90 seconds). Never written to disk."],
                ["Browser environment signals", "WebGL renderer string, screen dimensions, navigator.languages, timezone — read-only, used for bot-detection scoring, not stored after the challenge is resolved."],
                ["IP address (hashed)", "Your IP is hashed with a secret key before any use. The raw IP is never logged or stored. The hash is used only for rate-limiting."],
                ["Proof-of-Work nonce", "A cryptographic value your browser computes to prove it is a real device. Discarded immediately after verification."],
                ["Verification token (JWT)", "Issued on successful verification. Contains: hashed IP, site key, timestamp, and expiry. Valid for 2 minutes. No name, email, or personal identifier."],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-indigo-600 font-bold mt-0.5">→</span>
                  <div><strong className="text-slate-900">{title}:</strong> {desc}</div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">3. What We Do NOT Collect</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Your name, email, or any contact info",
                "Tracking cookies or cross-site cookies",
                "Device fingerprints stored beyond the session",
                "Browsing history or visited URLs",
                "Location data",
                "Audio or camera data",
                "Third-party analytics (no Google Analytics)",
                "Advertising IDs or ad profiles",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">4. Cookies</h2>
            <p>
              ShieldCaptcha uses <strong>no tracking cookies</strong>. The only session-related state is the
              short-lived verification token stored in your form and submitted with your request — it is never
              written to <code>document.cookie</code>.
            </p>
            <p className="mt-2">
              The website itself (this portal) may use a functional session cookie only if you interact with
              authenticated API features. No advertising or analytics cookies are set.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">5. Data Retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Data type</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Mouse trajectory", "Deleted immediately after verification"],
                    ["Browser signals", "Deleted immediately after verification"],
                    ["Hashed IP (rate-limit bucket)", "Automatically purged after 60 seconds of inactivity"],
                    ["Verification token (JWT)", "Expires in 2 minutes, single-use"],
                    ["Seen-trajectory hash (anti-replay)", "Purged after 10 minutes"],
                    ["IP fail counter", "Purged after lockout expires (10 minutes)"],
                  ].map(([dt, ret]) => (
                    <tr key={dt} className="even:bg-slate-50">
                      <td className="px-3 py-2 border border-slate-200 font-medium text-slate-800">{dt}</td>
                      <td className="px-3 py-2 border border-slate-200 text-slate-600">{ret}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">6. Legal Basis (GDPR / UK GDPR)</h2>
            <p>
              The legal basis for processing the limited technical data above is <strong>Legitimate Interest</strong>
              (Article 6(1)(f) GDPR) — specifically, the legitimate interest of protecting a web service from
              automated abuse, fraud, and spam. No consent is required because no personal data in the GDPR
              sense (name, email, identifier) is processed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">7. Your Rights</h2>
            <p>
              Because we do not store personal data linked to an individual, most data-subject rights (access,
              erasure, portability) are satisfied by default — there is nothing to retrieve or delete. If you
              believe ShieldCaptcha has stored personal data about you, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">8. Security</h2>
            <p>
              All in-flight data is encrypted with AES-CBC-128 (PBKDF2 key derivation, random IV per request).
              Verification tokens are HMAC-SHA256 signed. The backend enforces TLS, strict HSTS headers, and
              Content Security Policy on all responses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">9. Contact</h2>
            <p>For privacy questions or data-subject requests:</p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              <strong>ShieldCaptcha Project</strong><br />
              Email: <a href="mailto:privacy@shieldcaptcha.dev" className="text-indigo-600 hover:underline">privacy@shieldcaptcha.dev</a><br />
              Response time: within 72 hours
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
