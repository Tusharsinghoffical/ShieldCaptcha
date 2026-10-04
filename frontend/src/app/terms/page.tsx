import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ShieldCaptcha Enterprise",
  description: "Terms and conditions for using the ShieldCaptcha bot-defense SDK and API.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Legal Document
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Terms of Service</h1>
          <p className="text-slate-500 text-sm">
            <strong>Last updated:</strong> October 4, 2026 &nbsp;·&nbsp;
            <strong>Version:</strong> 1.0
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            By accessing, installing, or using ShieldCaptcha (the &quot;Service&quot;), you agree to these Terms.
            Read them carefully. If you do not agree, do not use the Service.
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">1. Acceptance</h2>
            <p>
              These Terms constitute a legally binding agreement between you (&quot;User&quot;, &quot;Operator&quot;, or &quot;you&quot;)
              and the ShieldCaptcha project (&quot;we&quot;, &quot;us&quot;). Use of this software implies full acceptance of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">2. License Grant</h2>
            <p>
              ShieldCaptcha is released under the <strong>MIT License</strong>. You are free to use, copy, modify,
              merge, publish, distribute, sublicense, or sell copies of the software, subject to the following conditions:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>The copyright notice and this permission notice must appear in all copies.</li>
              <li>Attribution to the ShieldCaptcha project must be retained in all derivative works.</li>
              <li>You may not claim that you created the original software.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">3. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to use ShieldCaptcha to:</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Deploy as a surveillance or mass data-collection tool",
                "Circumvent other legitimate security systems",
                "Process personal data in violation of GDPR, CCPA, or applicable law",
                "Build discriminatory or deceptive user flows",
                "Launch denial-of-service attacks against any system",
                "Resell as a commercial service without proper attribution",
              ].map(item => (
                <div key={item} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs">
                  <span className="text-red-500 font-bold mt-0.5">✕</span> {item}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">4. Disclaimer of Warranties</h2>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE AND NON-INFRINGEMENT.</strong> We do not warrant that the Service will be error-free,
              uninterrupted, or free from security vulnerabilities. Bot-defense is probabilistic — no system
              guarantees 100% protection.
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">5. Limitation of Liability</h2>
            <p>
              In no event shall the ShieldCaptcha authors or contributors be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of profits, data,
              use, goodwill, or business interruption, arising out of or relating to your use of or inability to
              use the Service — even if advised of the possibility of such damages.
            </p>
            <p className="mt-3">
              Our total liability for any claim shall not exceed <strong>USD $0</strong> (the software is provided
              free of charge).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">6. Intellectual Property</h2>
            <p>
              All original code, documentation, and assets in the ShieldCaptcha repository are owned by the
              respective contributors. Trademarks, logos, and service marks are not covered by the MIT License
              and may not be used without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">7. Third-Party Dependencies</h2>
            <p>
              ShieldCaptcha is designed to be zero-dependency at runtime. The client SDK uses only Web APIs
              available in modern browsers (SubtleCrypto, Web Workers, PointerEvents). Build-time tooling
              (Next.js, TypeScript) is subject to their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">8. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the software after changes constitutes
              acceptance. Material changes will be noted in the repository changelog and on this page with an
              updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">9. Governing Law</h2>
            <p>
              These Terms are governed by general international open-source software norms. For disputes
              involving commercial deployments, the laws of the jurisdiction in which the operator is registered
              shall apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">10. Contact</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              <strong>ShieldCaptcha Project</strong><br />
              Legal inquiries: <a href="mailto:legal@shieldcaptcha.dev" className="text-indigo-600 hover:underline">legal@shieldcaptcha.dev</a>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
