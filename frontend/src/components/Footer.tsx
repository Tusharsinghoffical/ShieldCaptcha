"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Cpu, Globe, CheckCircle2, Heart, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs">
      {/* Informative Top Notification Bar */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
            <span className="font-semibold text-slate-900">ShieldCaptcha Engine:</span>
            <span>Running on Port 3000 · 100% On-Premise &amp; Privacy Friendly</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Zero Tracking Cookies</span>
            <span>•</span>
            <span>No External Cloud Dependency</span>
            <span>•</span>
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>

      {/* Main Informative Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Column 1: About ShieldCaptcha */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png?v=5"
                alt="ShieldCaptcha"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="text-base font-bold text-slate-900 tracking-tight">ShieldCaptcha</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                v4.1 LTS
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              A modern, privacy-first bot defense system. Stops spam bots and scrapers without frustrating real users.
              Zero tracking cookies. No external cloud dependency.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free and open for developer integration</span>
            </div>
          </div>

          {/* Column 2: Defense Modes */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Defense Modes</h4>
            <ul className="flex flex-col gap-2 text-slate-500">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong className="text-slate-800">1-Click Check:</strong> Instant PoW verification in under 50ms.
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong className="text-slate-800">Jigsaw Puzzle:</strong> Magnetic slider that defeats CV bots.
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong className="text-slate-800">Auto Step-Up:</strong> Escalates suspicious clicks to puzzle.
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong className="text-slate-800">AES-CBC Encrypted:</strong> Telemetry encrypted in transit.
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Documentation & Help */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Documentation &amp; Guides</h4>
            <div className="flex flex-col gap-1.5 text-slate-600">
              <Link href="/docs" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Official Documentation</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/docs#quickstart" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Quickstart Guide (2 Minutes)</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/docs#install-node" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Node.js Backend Setup</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/docs#install-python" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Python FastAPI Setup</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/security" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Security Architecture</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Column 4: Live Tools */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Tools &amp; Testing</h4>
            <div className="flex flex-col gap-1.5 text-slate-600">
              <Link href="/demo" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Protected Sign In Demo</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/simulator" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Attack Simulator Lab</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/integration" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Code Snippets for Web Apps</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/contact" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Contact &amp; Support</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom: Legal Links Row */}
        <div className="border-t border-slate-200 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div className="text-center sm:text-left">
              © 2026 ShieldCaptcha Project. Open-source, privacy-first bot defense. MIT License.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <span className="text-slate-300">·</span>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <span className="text-slate-300">·</span>
              <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cookie Policy</Link>
              <span className="text-slate-300">·</span>
              <Link href="/security" className="hover:text-slate-900 transition-colors">Security</Link>
              <span className="text-slate-300">·</span>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
