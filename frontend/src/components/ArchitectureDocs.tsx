"use client";

import React from "react";
import { Cpu, EyeOff, ShieldCheck, Activity, Layers, Lock, Shield } from "lucide-react";

export function ArchitectureDocs() {
  const cards = [
    {
      icon: Cpu,
      title: "Bit-Level Proof-of-Work",
      color: "text-indigo-600",
      accentBg: "from-indigo-500",
      badge: "Web Worker",
      desc: "Client executes leading-zero SHA-256 computation in a multi-threaded Web Worker. Completes in ~18ms for legitimate users, while costing scraper botnets exponential CPU compute.",
    },
    {
      icon: Activity,
      title: "Flash & Hogan Minimum Jerk",
      color: "text-sky-600",
      accentBg: "from-sky-500",
      badge: "Biomechanical",
      desc: "Analyzes third-order velocity derivatives (da/dt jerk) and physiological micro-tremor harmonics. Bots generating linear trajectories or polynomial splines fail the biological motion test.",
    },
    {
      icon: EyeOff,
      title: "Adversarial Jigsaw Cutout",
      color: "text-emerald-600",
      accentBg: "from-emerald-500",
      badge: "Anti-Computer-Vision",
      desc: "Procedural Perlin fractal noise canvas with multi-tab Bézier shapes and single glowing target socket with ±24px magnetic tolerance for seamless 1st-try human alignment.",
    },
    {
      icon: Lock,
      title: "HMAC Single-Use Authorization",
      color: "text-purple-600",
      accentBg: "from-purple-500",
      badge: "Cryptographic",
      desc: "Each passed verification receives a cryptographically signed HMAC token containing a unique jti nonce and client IP hash. Single-use enforcement prevents replay attacks.",
    },
    {
      icon: Layers,
      title: "Dual Mode & Auto Step-Up",
      color: "text-amber-600",
      accentBg: "from-amber-500",
      badge: "Adaptive Defense",
      desc: "Frictionless 1-Click Checkbox for 98% of clean users. Suspicious automation immediately escalates to the interlocking Jigsaw slider challenge.",
    },
    {
      icon: ShieldCheck,
      title: "Hardware Integrity Audit",
      color: "text-rose-600",
      accentBg: "from-rose-500",
      badge: "CDP & WebDriver",
      desc: "Inspects Chrome DevTools Protocol flags, WebGL software renderers (SwiftShader, llvmpipe), and IDL property tampering to instantly flag headless environments.",
    },
  ];

  return (
    <div id="architecture" className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-3 mb-8 gap-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Security Blueprint</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Core Defense Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-500">Multi-layered security mechanics engineered into ShieldCaptcha</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.accentBg} to-transparent opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700">
                    {c.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
