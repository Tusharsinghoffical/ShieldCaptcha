"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CaptchaWidget } from "@/components/CaptchaWidget";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Check,
  ShieldCheck, 
  Lock, 
  Mail, 
  Sliders, 
  RotateCcw, 
  Loader2, 
  ShieldAlert 
} from "lucide-react";

type AuthMode = "checkbox" | "jigsaw" | "adaptive";

export default function DemoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeMode, setActiveMode] = useState<AuthMode>("checkbox");
  const [email, setEmail] = useState<string>("developer@enterprise.io");
  const [verifiedToken, setVerifiedToken] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [authResult, setAuthResult] = useState<{
    success: boolean;
    message?: string;
    trustScore?: number;
    authMode?: string;
    error?: string;
  } | null>(null);

  // Step 1 -> Step 2
  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setVerifiedToken("");
    setAuthResult(null);
    setStep(2);
  };

  // Step 2 -> Step 3 (Submit & Authorize)
  const handleSubmitVerification = async () => {
    if (!verifiedToken) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captcha: verifiedToken }),
      });
      const data = await res.json();
      setAuthResult(data);
      setStep(3);
    } catch {
      setAuthResult({ success: false, error: "Network error reaching authorization server" });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setVerifiedToken("");
    setAuthResult(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-7 border border-slate-200 shadow-md relative overflow-hidden">
          
          {/* Header with Official Logo */}
          <div className="flex items-center gap-3.5 mb-6 border-b border-slate-200 pb-4">
            <img
              src="/logo.png?v=5"
              alt="ShieldCaptcha"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Protected Sign In</h1>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                Enterprise Multi-Step Verification
              </span>
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between mb-7 px-2">
            {[
              { num: 1, title: "Account" },
              { num: 2, title: "Verify" },
              { num: 3, title: "Confirm" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.num
                        ? "bg-emerald-600 text-white shadow-sm"
                        : step === s.num
                        ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide ${
                      step === s.num ? "text-indigo-700" : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 transition-all ${
                      step > idx + 1 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ================= STEP 1: Account & Defense Mode ================= */}
          {step === 1 && (
            <form onSubmit={handleProceedToVerification} className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  Account Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.io"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                  required
                  autoFocus
                  autoComplete="email"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enter your credentials to initiate a secure verification session.
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Select Verification Defense Mode
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  {(["checkbox", "jigsaw", "adaptive"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActiveMode(m)}
                      className={`py-2 px-1 rounded-lg transition-all text-[11px] font-semibold text-center ${
                        activeMode === m
                          ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {m === "checkbox" ? "1-Click" : m === "jigsaw" ? "Jigsaw Slider" : "Adaptive Step-Up"}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 px-1">
                  {activeMode === "checkbox" && "Fast Proof-of-Work Turnstile verification (under 20ms)."}
                  {activeMode === "jigsaw" && "Interactive magnetic jigsaw puzzle slider challenge."}
                  {activeMode === "adaptive" && "Smart automatic risk-based security escalation."}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue to Security Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= STEP 2: Biomechanical Verification ================= */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Verifying for: <strong className="text-slate-900">{email}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold underline"
                >
                  Change
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[140px] text-center">
                <span className="text-xs font-semibold text-slate-700 mb-3 block">
                  Complete the Security Challenge ({activeMode === "checkbox" ? "1-Click PoW" : activeMode === "jigsaw" ? "Jigsaw Slider" : "Auto Step-Up"}):
                </span>
                
                <CaptchaWidget
                  mode={activeMode}
                  onToken={(t) => {
                    setVerifiedToken(t);
                  }}
                  onReset={() => {
                    setVerifiedToken("");
                  }}
                  onTrajectory={() => {}}
                />
              </div>

              {verifiedToken ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cryptographic proof generated! Ready to submit.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitVerification}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating with Server...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit & Authorize Session</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500">
                  Please complete the security check above to proceed.
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center gap-1.5 mt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Details
              </button>
            </div>
          )}

          {/* ================= STEP 3: Confirmation ================= */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {authResult?.success ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    Access Successfully Authorized!
                  </h2>
                  <p className="text-xs text-emerald-700 font-semibold mb-4">
                    Cryptographically Signed & Consumed Single-Use Token
                  </p>

                  <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-xs text-left flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Authenticated Account:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[200px]">{email}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Defense Mode Used:</span>
                      <span className="font-semibold text-indigo-700 capitalize">{authResult.authMode || activeMode}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Biomechanical Trust Score:</span>
                      <span className="font-bold text-emerald-700">{authResult.trustScore || 95} / 100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK Authorized
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">Authorization Rejected</h2>
                  <p className="text-xs text-rose-600 mb-4">
                    {authResult?.error || "Token verification failed on the server"}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Verify Another Account (Restart)</span>
                </button>

                <Link
                  href="/"
                  className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all text-center text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Enterprise Portal</span>
                </Link>
              </div>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Enterprise Portal
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Informative Simple English Footer */}
      <Footer />
    </div>
  );
}
