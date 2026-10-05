"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Globe,
  CheckCircle2,
  ArrowUpRight,
  Terminal,
  KeyRound,
  FileCode,
  Sparkles
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand & Identity (2 cols on large) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo.png?v=5"
                alt="ShieldCaptcha"
                width={32}
                height={32}
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                ShieldCaptcha
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                v4.2 Enterprise
              </span>
            </Link>

            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Next-generation bot mitigation engine. Hardened Proof-of-Work, anti-CV jigsaw puzzles, and biomechanical
              kinematics with zero tracking cookies and 100% on-premise execution.
            </p>

            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Engine Status: Operational (Active)</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/Tusharsinghoffical/ShieldCaptcha"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Column 2: Product & Modes */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Product &amp; Demos</h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors block">
                  Live Interactive Trial
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-indigo-600 transition-colors block">
                  Protected Sign In Form
                </Link>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-indigo-600 transition-colors block">
                  Attack Simulator Lab
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-indigo-600 transition-colors block">
                  How the Engine Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers & API */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Developers &amp; API</h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/api-keys" className="hover:text-indigo-600 transition-colors font-semibold text-indigo-600 flex items-center justify-between">
                  <span>API Keys &amp; Console</span>
                  <span className="text-[9px] bg-indigo-50 border border-indigo-200 px-1 rounded text-indigo-700 font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-indigo-600 transition-colors block">
                  Documentation &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/integration" className="hover:text-indigo-600 transition-colors block">
                  SDKs &amp; Code Snippets
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-indigo-600 transition-colors block">
                  Interactive Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Trust &amp; Legal</h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/security" className="hover:text-indigo-600 transition-colors block">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition-colors block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-indigo-600 transition-colors block">
                  Cookie Policy (Zero-Cookie)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 transition-colors block">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © 2026 ShieldCaptcha Project. Open-source under MIT License. Zero tracking cookies.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/cookies" className="hover:text-slate-700 transition-colors">
              Cookies
            </Link>
            <span>·</span>
            <Link href="/security" className="hover:text-slate-700 transition-colors">
              Security
            </Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-slate-700 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
