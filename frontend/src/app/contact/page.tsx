import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { Bug, ShieldCheck, BookOpen, Briefcase, Scale, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get in touch with the ShieldCaptcha team for bug reports, security disclosures, integrations, and enterprise inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Support &amp; Community
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Contact &amp; Support</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Have questions about ShieldCaptcha? Need technical support or have a security disclosure?
            We are here to help.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {[
            {
              Icon: Bug,
              title: "Bug Reports",
              desc: "Found a bug or unexpected behavior? Open an issue on GitHub with steps to reproduce.",
              cta: "Open GitHub Issue",
              href: "https://github.com/Tusharsinghoffical/ShieldCaptcha/issues/new",
            },
            {
              Icon: ShieldCheck,
              title: "Security Vulnerabilities",
              desc: "Please do NOT open public issues for security bugs. Email us privately for responsible disclosure.",
              cta: "security@shieldcaptcha.dev",
              href: "mailto:security@shieldcaptcha.dev",
            },
            {
              Icon: BookOpen,
              title: "Integration Help",
              desc: "Having trouble integrating ShieldCaptcha? Check the docs first, then ask on GitHub Discussions.",
              cta: "Read the Docs",
              href: "/docs",
            },
            {
              Icon: Briefcase,
              title: "Enterprise & Custom",
              desc: "Need a custom integration, SLA support, or a DPA for GDPR compliance? Reach out by email.",
              cta: "enterprise@shieldcaptcha.dev",
              href: "mailto:enterprise@shieldcaptcha.dev",
            },
            {
              Icon: Scale,
              title: "Legal & Privacy",
              desc: "Privacy policy questions, data-subject requests, or legal inquiries.",
              cta: "legal@shieldcaptcha.dev",
              href: "mailto:legal@shieldcaptcha.dev",
            },
            {
              Icon: Lightbulb,
              title: "Feature Requests",
              desc: "Have an idea to improve ShieldCaptcha? Start a Discussion on GitHub to get community feedback.",
              cta: "Start a Discussion",
              href: "https://github.com/Tusharsinghoffical/ShieldCaptcha/discussions",
            },
          ].map(({ Icon, title, desc, cta, href }) => (
            <a
              key={title}
              href={href}
              className="block p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-4 text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{desc}</p>
              <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
                {cta} →
              </span>
            </a>
          ))}
        </div>

        {/* Company / Legal Entity Info */}
        <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50">
          <h2 className="text-base font-bold text-slate-900 mb-4">Project Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              ["Project name", "ShieldCaptcha"],
              ["Version", "Enterprise v4.2 — Hardened Security Edition"],
              ["License", "MIT License (open source)"],
              ["Type", "Self-hosted, on-premise bot-defense SDK"],
              ["General contact", "hello@shieldcaptcha.dev"],
              ["Response time", "Within 48 hours on business days"],
              ["Documentation", "/docs"],
              ["Security policy", "/security"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                <dd className="mt-0.5 text-slate-900 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <Footer />
    </div>
  );
}
