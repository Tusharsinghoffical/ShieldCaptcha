"use client";

import React, { useEffect, useState } from "react";
import { Shield, Zap, Lock, Activity, Users, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StatsData {
  totalChallenges: number;
  verifiedHumans: number;
  blockedBots: number;
  escalatedToPuzzle: number;
  uptimeSec: number;
  siteKey?: string;
}

export function Hero() {
  const [stats, setStats] = useState<StatsData>({
    totalChallenges: 14,
    verifiedHumans: 10,
    blockedBots: 4,
    escalatedToPuzzle: 1,
    uptimeSec: 420,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center pt-8 pb-10 max-w-4xl mx-auto px-4">
      {/* Center Emblem Logo */}
      <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center group">
        <img
          src="/logo.png?v=5"
          alt="ShieldCaptcha Official Logo"
          width={96}
          height={96}
          className="relative w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Next.js 16 & TypeScript Bot Defense Engine</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4"
      >
        Fast for Real Humans. <br />
        <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
          Impossible for Automated Bots.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8"
      >
        ShieldCaptcha protects your login and registration forms using <strong>1-Click Proof-of-Work checks</strong> and <strong>Anti-Bot Jigsaw Puzzles</strong>. Zero tracking cookies, zero dependencies, and instant verification.
      </motion.p>

      {/* Metrics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-left"
      >
        <div className="bg-white rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            Challenges
          </span>
          <span className="text-2xl font-bold font-mono text-sky-700">{stats.totalChallenges}</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">{stats.verifiedHumans}</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            Blocked Bots
          </span>
          <span className="text-2xl font-bold font-mono text-rose-700">{stats.blockedBots}</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Escalations
          </span>
          <span className="text-2xl font-bold font-mono text-purple-700">{stats.escalatedToPuzzle}</span>
        </div>

        <div className="bg-white col-span-2 sm:col-span-1 rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            Avg Latency
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-700">18ms</span>
        </div>
      </motion.div>
    </div>
  );
}
