"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { CaptchaWidget } from "@/components/CaptchaWidget";
import { KinematicsOscilloscope } from "@/components/KinematicsOscilloscope";
import { AttackSimulator } from "@/components/AttackSimulator";
import { TokenInspector } from "@/components/TokenInspector";
import { IntegrationHub } from "@/components/IntegrationHub";
import { ArchitectureDocs } from "@/components/ArchitectureDocs";
import { FaqSection } from "@/components/FaqSection";
import {
  ShieldCheck,
  Sparkles,
  Terminal,
  Activity,
  Bot,
  CheckCircle2,
  Sliders,
  Zap,
  Check,
  Lock,
  Cpu,
  Trash2,
  ArrowRight,
  Info,
  Layers,
  RefreshCw,
  Fingerprint
} from "lucide-react";

export default function Home() {
  const [activeMode, setActiveMode] = useState<"checkbox" | "jigsaw" | "adaptive">("checkbox");
  const [verifiedToken, setVerifiedToken] = useState<string>("");
  const [lastPoint, setLastPoint] = useState<any>(null);
  const [controller, setController] = useState<any>(null);
  const [email, setEmail] = useState<string>("developer@enterprise.io");
  const [rightTab, setRightTab] = useState<"kinematics" | "simulator" | "audit">("kinematics");
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; type: string; tag: string; msg: string }>>([
    {
      time: "INIT",
      type: "info",
      tag: "SYSTEM",
      msg: "ShieldCaptcha Engine Armed on Port 3000. Dual defense online.",
    },
  ]);
  const auditEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#simulator" || hash === "#attack-simulator") {
        setRightTab("simulator");
        const el = document.getElementById("simulator");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#kinematics") {
        setRightTab("kinematics");
        const el = document.getElementById("simulator");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#audit") {
        setRightTab("audit");
        const el = document.getElementById("simulator");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const addLog = (type: "pass" | "block" | "info", tag: string, msg: string) => {
    setAuditLogs((prev) => [
      ...prev,
      {
        time: new Date().toTimeString().split(" ")[0],
        type,
        tag,
        msg,
      },
    ]);
  };

  const clearLogs = () => {
    setAuditLogs([
      {
        time: new Date().toTimeString().split(" ")[0],
        type: "info",
        tag: "SYSTEM",
        msg: "Audit log buffer cleared.",
      },
    ]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedToken) return;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captcha: verifiedToken }),
      });
      const data = await res.json();
      if (data.success) {
        addLog("pass", "AUTH_PASS", `Signup authorized for ${email}! Mode: ${data.authMode || activeMode}`);
      } else {
        addLog("block", "AUTH_FAIL", `Signup rejected: ${data.error}`);
      }
    } catch {
      addLog("block", "NET_ERR", "Could not reach server endpoint.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] text-slate-800 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Subtle Top Ethereal Accent Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />

      <Navbar />

      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section */}
        <Hero />

        {/* Section 1: Interactive Trial Playground */}
        <section id="trial" className="scroll-mt-24 mb-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-4 mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Interactive Defense Playground
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Experience instant human verification and real-time biomechanical kinematics analysis.
              </p>
            </div>

            {/* Live Telemetry Pill */}
            <div className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600">Defense Pipeline:</span>
              <span className="text-indigo-600 font-bold uppercase">{activeMode}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Protected Authentication Form */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Protected Sign-In Form</h3>
                    <p className="text-[11px] text-slate-500">Live Client-Side SDK Integration</p>
                  </div>
                </div>

                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shield Active
                </span>
              </div>

              {/* Mode Switcher Segmented Control */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Defense Mode
                </label>
                <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("checkbox");
                      addLog("info", "MODE_SWITCH", "Active mode switched to: 1-Click Checkbox");
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all text-xs font-bold ${
                      activeMode === "checkbox"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>1-Click</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("jigsaw");
                      addLog("info", "MODE_SWITCH", "Active mode switched to: Jigsaw Puzzle");
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all text-xs font-bold ${
                      activeMode === "jigsaw"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Jigsaw</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("adaptive");
                      addLog("info", "MODE_SWITCH", "Active mode switched to: Adaptive Step-Up");
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all text-xs font-bold ${
                      activeMode === "adaptive"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Step-Up</span>
                  </button>
                </div>

                {/* Dynamic Mode Helper Info */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {activeMode === "checkbox" && "Zero-friction 1-click verification using SHA-256 Proof-of-Work in under 20ms."}
                    {activeMode === "jigsaw" && "Interactive slider challenge analyzing pointer trajectory, velocity jitter, and minimum-jerk acceleration."}
                    {activeMode === "adaptive" && "Dynamically escalates from 1-Click to Jigsaw puzzle if suspicious automation is detected."}
                  </span>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    required
                    suppressHydrationWarning
                    autoComplete="email"
                  />
                </div>

                {/* Security Verification Mount Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Security Verification</span>
                    <span className="text-[10px] text-slate-400 font-mono">ShieldCaptcha Universal Widget</span>
                  </label>
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/90 flex justify-center">
                    <CaptchaWidget
                      mode={activeMode}
                      onToken={(token, meta) => {
                        setVerifiedToken(token);
                        addLog("pass", "HUMAN_PASS", `Verified human! Trust Score: ${meta.score || 95} (mode: ${meta.mode || activeMode})`);
                      }}
                      onReset={() => setVerifiedToken("")}
                      onTrajectory={(pt) => setLastPoint(pt)}
                      onControllerReady={(c) => setController(c)}
                    />
                  </div>
                </div>

                {/* Form Action Button */}
                <button
                  type="submit"
                  disabled={!verifiedToken}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                    verifiedToken
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  {verifiedToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Authenticate &amp; Submit Request</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Complete Verification to Continue</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Diagnostics & Telemetry Station */}
            <div id="simulator" className="scroll-mt-24 lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-5">
              {/* Tab Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRightTab("kinematics")}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                      rightTab === "kinematics"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Kinematics Radar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightTab("simulator")}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                      rightTab === "simulator"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                    <span>Attack Simulator Lab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightTab("audit")}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                      rightTab === "audit"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Audit Stream</span>
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                      {auditLogs.length}
                    </span>
                  </button>
                </div>

                {rightTab === "audit" && (
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              {/* Tab Contents */}
              {rightTab === "kinematics" && (
                <div>
                  <KinematicsOscilloscope lastPoint={lastPoint} />
                </div>
              )}

              {rightTab === "simulator" && (
                <div>
                  <AttackSimulator controller={controller} onLog={addLog} />
                </div>
              )}

              {rightTab === "audit" && (
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col">
                  {/* Console Header Bar */}
                  <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 text-slate-300">shieldcaptcha-audit.log</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">● STREAMING</span>
                  </div>

                  {/* Console Stream */}
                  <div className="p-4 h-[260px] overflow-y-auto font-mono text-xs flex flex-col gap-2.5 select-text">
                    {auditLogs.map((l, i) => (
                      <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-slate-500 shrink-0">[{l.time}]</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            l.type === "pass"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : l.type === "block"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          }`}
                        >
                          {l.tag}
                        </span>
                        <span className="text-slate-300">{l.msg}</span>
                      </div>
                    ))}
                    <div ref={auditEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Token Claims Inspector */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-3 mb-6 gap-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold tracking-wide uppercase mb-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cryptographic Proof</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Decoded Authorization Claims
              </h2>
            </div>
            <p className="text-xs text-slate-500">HMAC-SHA256 Token Inspection &amp; Server-to-Server Verification</p>
          </div>
          <TokenInspector token={verifiedToken} />
        </section>

        {/* Section 3: Developer Integration Hub */}
        <section id="integration" className="scroll-mt-24 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-3 mb-6 gap-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Developer SDKs</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Quick Integration Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500">Copy-paste ready snippets to protect any web application in minutes</p>
          </div>
          <IntegrationHub />
        </section>

        {/* Section 4: Architecture */}
        <section id="architecture" className="scroll-mt-24 mb-16">
          <ArchitectureDocs />
        </section>

        {/* Section 5: Technical SEO FAQ & Knowledge Base */}
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
