"use client";

import React, { useState } from "react";
import { Bot, Zap, TrendingUp, MonitorSmartphone, ShieldAlert, CheckCircle2 } from "lucide-react";

interface AttackSimulatorProps {
  controller: any;
  onLog: (type: "pass" | "block" | "info", tag: string, message: string) => void;
}

export function AttackSimulator({ controller, onLog }: AttackSimulatorProps) {
  const [loadingAttack, setLoadingAttack] = useState<string | null>(null);
  const [lastVerdict, setLastVerdict] = useState<any>(null);

  const attacks = [
    {
      id: "linear",
      title: "Linear Constant Velocity Bot",
      desc: "Simulates automated robotic mouse movements without natural human hand tremors.",
      icon: Bot,
      color: "text-amber-600",
      expected: "Blocked: Lack of biological micro-tremor",
    },
    {
      id: "teleport",
      title: "Instant Coordinate Teleporter",
      desc: "Submits in under 15ms directly at target slot without any intermediate physical path.",
      icon: Zap,
      color: "text-rose-600",
      expected: "Blocked: Impossible physics timing violation",
    },
    {
      id: "bezier",
      title: "Synthetic Polynomial Spline Bot",
      desc: "Mathematical curve lacking natural Fitts' law acceleration and human deceleration.",
      icon: TrendingUp,
      color: "text-purple-600",
      expected: "Blocked: Jerk derivative anomaly",
    },
    {
      id: "headless",
      title: "Headless Chrome Automation Profile",
      desc: "Triggers CDP automation flags (navigator.webdriver = true) and virtualized GPU renderers.",
      icon: MonitorSmartphone,
      color: "text-red-600",
      expected: "Blocked: Automation driver fingerprint detected",
    },
  ];

  const handleSimulate = async (attackId: string) => {
    if (!controller || typeof controller.simulateBot !== "function") {
      alert("Captcha engine is still initializing. Please wait 1 second.");
      return;
    }

    setLoadingAttack(attackId);
    onLog("info", "ATTACK_LAUNCH", `Launching automated ${attackId} exploit test against engine...`);

    try {
      const res = await controller.simulateBot(attackId);
      setLastVerdict(res);
      if (res.ok) {
        onLog("pass", "UNEXPECTED", `Attack completed`);
      } else {
        onLog("block", "EXPLOIT_BLOCKED", `Engine successfully blocked: ${res.reason}`);
      }
    } catch (e: any) {
      onLog("block", "ERROR", `Attack execution failed: ${e?.message}`);
    } finally {
      setLoadingAttack(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2.5">
        {attacks.map((att) => {
          const Icon = att.icon;
          const isLoading = loadingAttack === att.id;

          return (
            <div
              key={att.id}
              className="bg-white rounded-xl p-3.5 flex items-center justify-between gap-4 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 mt-0.5">
                  <Icon className={`w-4 h-4 ${att.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">{att.title}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{att.desc}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulate(att.id)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Simulating..." : "Test Attack"}
              </button>
            </div>
          );
        })}
      </div>

      {lastVerdict && (
        <div className={`p-3 rounded-lg text-xs border flex items-center justify-between ${
          lastVerdict.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <div className="flex items-center gap-2">
            {lastVerdict.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-600" />}
            <span className="font-semibold">
              Verdict: {lastVerdict.ok ? "Approved" : `BLOCKED (${lastVerdict.reason || "anomaly_detected"})`}
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold">Trust Score: {lastVerdict.score || 0}</span>
        </div>
      )}
    </div>
  );
}
