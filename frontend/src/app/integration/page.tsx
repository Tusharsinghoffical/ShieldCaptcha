"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IntegrationHub } from "@/components/IntegrationHub";
import { Code2, ArrowLeft, BookOpen, KeyRound, Terminal, CheckCircle2 } from "lucide-react";

export default function IntegrationPage() {
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
              <span className="text-slate-700">Developer Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Code2 className="w-8 h-8 text-sky-600" />
              <span>Developer Integration Hub & SDK</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Integrate ShieldCaptcha Enterprise v4.0 into any application in minutes. Ready-to-copy code snippets for HTML, React/Next.js, Node.js, Python, PHP, and Go.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              REST API Ready
            </span>
          </div>
        </div>

        {/* Integration Hub Component */}
        <IntegrationHub />

        {/* Verification Architecture Banner */}
        <div className="mt-8 rounded-2xl p-6 border border-indigo-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-center shrink-0">
              <img src="/logo.png?v=5" alt="Shield" className="w-7 h-7 object-contain drop-shadow-xs" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Need Complete API Documentation?</h3>
              <p className="text-xs text-slate-600">View detailed parameter references, HMAC verification schemas, and Docker configs.</p>
            </div>
          </div>
          <Link
            href="/architecture"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap"
          >
            Explore Architecture & API Specs →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

