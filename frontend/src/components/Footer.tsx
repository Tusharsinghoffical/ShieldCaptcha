"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Globe,
  CheckCircle2,
  Terminal,
  KeyRound,
  FileCode,
  Sparkles
} from "lucide-react";


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
