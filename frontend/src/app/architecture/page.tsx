"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArchitectureDocs } from "@/components/ArchitectureDocs";
import { ShieldCheck, ArrowLeft, Shield, Cpu, Lock, Terminal } from "lucide-react";

export default function ArchitecturePage() {
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
              <span className="text-slate-700">Architecture & Cryptography</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span>Enterprise Security Architecture</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Deep dive into ShieldCaptcha’s multi-layered defense model: WebWorker Proof-of-Work, Flash & Hogan minimum-jerk kinematics, procedural Anti-CV shaders, and atomic HMAC token authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
              <img src="/logo.png?v=5" alt="Shield" className="w-6 h-6 object-contain" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-900">HMAC-SHA256</span>
              <span className="block text-[11px] text-emerald-700 font-semibold">Zero Dependencies</span>
            </div>
          </div>
        </div>

        {/* Architecture Docs Component */}
        <ArchitectureDocs />
      </main>

      <Footer />
    </div>
  );
}

