"use client";

import React from "react";
import { Cpu, EyeOff, ShieldCheck, Activity, Layers, Lock } from "lucide-react";

export function ArchitectureDocs() {
  const cards = [
    {
      icon: Cpu,
      title: "Bit-Level Proof-of-Work",
      color: "text-indigo-600",
      badge: "Web Worker",
      desc: "Client executes leading-zero SHA-256 computation in a multi-threaded Web Worker. Completes in ~18ms for legitimate users, while costing scraper botnets exponential CPU compute.",
    },
    {
      icon: Activity,
      title: "Flash & Hogan Minimum Jerk",
      color: "text-sky-600",
      badge: "Biomechanical",
      desc: "Analyzes third-order velocity derivatives (da/dt jerk) and physiological micro-tremor harmonics. Bots generating linear trajectories or polynomial splines fail the biological motion test.",
    },
    {
      icon: EyeOff,
      title: "Adversarial Jigsaw Cutout",
      color: "text-emerald-600",
      badge: "Anti-Computer-Vision",
      desc: "Procedural Perlin fractal noise canvas with multi-tab Bézier shapes and single glowing target socket with ±24px magnetic tolerance for seamless 1st-try human alignment.",
    },
    {
      icon: Lock,
      title: "HMAC Single-Use Authorization",
      color: "text-purple-600",
      badge: "Cryptographic",
      desc: "Each passed verification receives a cryptographically signed HMAC token containing a unique jti nonce and client IP hash. Single-use enforcement prevents replay attacks.",
    },
    {
      icon: Layers,
      title: "Dual Mode & Auto Step-Up",
      color: "text-amber-600",
      badge: "Adaptive Defense",
      desc: "Frictionless 1-Click Checkbox for 98% of clean users. Suspicious automation immediately escalates to the interlocking Jigsaw slider challenge.",
    },
    {
      icon: ShieldCheck,
      title: "Hardware Integrity Audit",
      color: "text-rose-600",
      badge: "CDP & WebDriver",
      desc: "Inspects Chrome DevTools Protocol flags, WebGL software renderers (SwiftShader, llvmpipe), and IDL property tampering to instantly flag headless environments.",
    },
  ];

  return (
    <div id="architecture" className="my-10">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🛡️ Core Defense Architecture</span>
          </h2>
          <p className="text-xs text-slate-500">Deep multi-layered security mechanics engineered into ShieldCaptcha</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                    {c.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

