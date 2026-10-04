"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { CaptchaWidget } from "@/components/CaptchaWidget";
import { KinematicsOscilloscope } from "@/components/KinematicsOscilloscope";
import { AttackSimulator } from "@/components/AttackSimulator";
import { TokenInspector } from "@/components/TokenInspector";
import { IntegrationHub } from "@/components/IntegrationHub";
import { ArchitectureDocs } from "@/components/ArchitectureDocs";
import { ShieldCheck, Sparkles, Terminal, Activity, Bot } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Hero />

        {/* Section 1: Live Interactive Trial */}
        <section id="trial" className="scroll-mt-24 mb-12">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Interactive Trial Playground</span>
              </h2>
              <p className="text-xs text-slate-500">
                Experience instant human verification and real-time biomechanical analysis
              </p>
            </div>
            <div className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              Mode: {activeMode.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Protected Form */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Protected Authentication Form</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Shield
                </span>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
                {(["checkbox", "jigsaw", "adaptive"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setActiveMode(m);
                      addLog("info", "MODE_SWITCH", `Active mode switched to: ${m}`);
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all capitalize text-[11px] ${
                      activeMode === m
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m === "checkbox" ? "1-Click" : m === "jigsaw" ? "Jigsaw Slider" : "Adaptive Step-Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                    suppressHydrationWarning
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Verification</label>
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

                <button
                  type="submit"
                  disabled={!verifiedToken}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md text-white disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-600/20 active:scale-[0.99]"
                >
                  {verifiedToken ? "Authenticate & Submit" : "Complete Verification to Continue"}
                </button>
              </form>
            </div>

            {/* Right: Radar & Diagnostics Tabbed Panel */}
            <div id="simulator" className="scroll-mt-24 lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setRightTab("kinematics")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    rightTab === "kinematics" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Kinematics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab("simulator")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    rightTab === "simulator" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Attack Simulator Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab("audit")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    rightTab === "audit" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Live Audit Log</span>
                </button>
              </div>

              {rightTab === "kinematics" && <KinematicsOscilloscope lastPoint={lastPoint} />}
              {rightTab === "simulator" && <AttackSimulator controller={controller} onLog={addLog} />}
              {rightTab === "audit" && (
                <div className="bg-slate-900 rounded-xl p-3 h-[250px] overflow-y-auto font-mono text-xs flex flex-col gap-2 border border-slate-800">
                  {auditLogs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-500 shrink-0">[{l.time}]</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          l.type === "pass"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : l.type === "block"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-sky-500/20 text-sky-400"
                        }`}
                      >
                        {l.tag}
                      </span>
                      <span className="text-slate-300">{l.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Token Claims Inspector */}
        <section className="mb-12">
          <TokenInspector token={verifiedToken} />
        </section>

        {/* Section 3: Integration Center */}
        <section id="integration" className="scroll-mt-24 mb-12">
          <div className="border-b border-slate-200 pb-3 mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Developer Integration &amp; SDK Hub</span>
            </h2>
            <p className="text-xs text-slate-500">Copy-paste ready snippets to protect any web application in minutes</p>
          </div>
          <IntegrationHub />
        </section>

        {/* Section 4: Architecture */}
        <section id="architecture" className="scroll-mt-24">
          <ArchitectureDocs />
        </section>
      </main>

      {/* Informative Simple English Footer */}
      <Footer />
    </div>
  );
}
