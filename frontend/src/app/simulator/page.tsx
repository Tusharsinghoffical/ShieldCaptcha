"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AttackSimulator } from "@/components/AttackSimulator";
import { KinematicsOscilloscope } from "@/components/KinematicsOscilloscope";
import { CaptchaWidget } from "@/components/CaptchaWidget";
import { ShieldCheck, Bot, Activity, Terminal, ArrowLeft, ExternalLink, Cpu } from "lucide-react";

export default function SimulatorPage() {
  const [controller, setController] = useState<any>(null);
  const [lastPoint, setLastPoint] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; type: string; tag: string; msg: string }>>([
    {
      time: "INIT",
      type: "info",
      tag: "SYSTEM",
      msg: "Attack Simulator Lab Environment armed and ready.",
    },
  ]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
              <Link href="/" className="hover:text-indigo-900 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700">Attack Simulator Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Bot className="w-8 h-8 text-sky-600" />
              <span>Real-Time Bot Attack Simulator Lab</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Simulate realistic adversarial bot attacks (linear interpolation scripts, zero-latency coordinate teleports, synthetic Bézier spline generation, and headless CDP automation) to test the behavioral defense engine in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Telemetry Online
            </span>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Attack Controls & Target Widget */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Target Live Widget</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Interactive Target</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Defense Widget (Target)</label>
                <CaptchaWidget
                  mode="adaptive"
                  onToken={(t, meta) => {
                    addLog("pass", "HUMAN_PASS", `Verified! Score: ${meta.score || 95} (mode: ${meta.mode})`);
                  }}
                  onReset={() => {}}
                  onTrajectory={(pt) => setLastPoint(pt)}
                  onControllerReady={(c) => setController(c)}
                />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                The Attack Simulator below commands this live target instance directly. When an automated exploit is launched, kinematics tracking and tamper-detection analyze its biomechanical signature.
              </p>
            </div>

            {/* Attack Simulator Suite */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Bot className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-sm text-slate-900">Adversarial Bot Attack Vectors</span>
              </div>
              <AttackSimulator controller={controller} onLog={addLog} />
            </div>
          </div>

          {/* Right Column: Kinematics Radar & Live Audit Telemetry */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-sm text-slate-900">Kinematics & Micro-Tremor Radar</span>
                </div>
                <span className="text-[11px] font-semibold text-sky-600">Oscilloscope</span>
              </div>
              <KinematicsOscilloscope lastPoint={lastPoint} />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Live Threat Audit Stream</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditLogs([{ time: new Date().toTimeString().split(" ")[0], type: "info", tag: "SYSTEM", msg: "Logs cleared." }])}
                  className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Clear Console
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-3 sm:p-3.5 h-[260px] sm:h-[280px] max-h-[45vh] overflow-y-auto font-mono text-xs flex flex-col gap-2 border border-slate-800 shadow-inner">
                {auditLogs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 shrink-0">[{l.time}]</span>
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

