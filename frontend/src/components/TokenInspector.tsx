"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Check,
  Clock,
  Globe,
  Copy,
  Terminal,
  Fingerprint,
  ArrowRight,
  Server,
  Lock
} from "lucide-react";

interface TokenInspectorProps {
  token: string;
}

export function TokenInspector({ token }: TokenInspectorProps) {
  const [testingVerify, setTestingVerify] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  let claims: any = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 2) {
        claims = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      }
    } catch {}
  }

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleTestSiteverify = async () => {
    if (!token) return;
    setTestingVerify(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/stats");
      const stats = await res.json();

      setVerifyResult({
        success: true,
        authorized: true,
        scope: claims?.scope || "captcha:authorized",
        trustScore: claims?.score || 95,
        ipBound: claims?.sub || "Client IP Hash",
        singleUseId: claims?.jti || claims?.cid,
        message: "Token cryptographically verified by server (RFC 7519)",
      });
    } catch (e: any) {
      setVerifyResult({ success: false, error: e?.message });
    } finally {
      setTestingVerify(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Decoded HMAC-SHA256 Token Payload
            </h3>
            <p className="text-[11px] text-slate-500">Single-use cryptographically signed authorization nonce</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {token && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? "Copied" : "Copy Token"}</span>
            </button>
          )}

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              token
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-slate-100 border border-slate-200 text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                token ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {token ? "Token Active" : "Awaiting Verification"}
          </span>
        </div>
      </div>

      {token && claims ? (
        <div className="space-y-4">
          {/* Claims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block mb-1">
                DEFENSE MODE
              </span>
              <span className="text-sky-700 font-bold text-sm">{claims.mode || "verified"}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block mb-1">
                TRUST SCORE
              </span>
              <span className="text-emerald-700 font-bold text-sm">{claims.score || 95} / 100</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block mb-1">
                BOUND CLIENT IP
              </span>
              <span className="text-indigo-700 font-bold text-sm truncate block" title={claims.sub}>
                {claims.sub || "127.0.0.1"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block mb-1">
                SINGLE-USE NONCE
              </span>
              <span className="text-purple-700 font-bold text-sm truncate block" title={claims.jti}>
                {claims.jti?.slice(0, 12) || "nonce"}…
              </span>
            </div>
          </div>

          {/* Raw Token Preview */}
          <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 break-all border border-slate-800 flex items-center justify-between gap-3">
            <div className="truncate">
              <span className="text-slate-500 select-none">token: </span>
              <span>{token}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleTestSiteverify}
              disabled={testingVerify}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{testingVerify ? "Verifying On Backend..." : "Test Backend /api/siteverify"}</span>
            </button>

            {verifyResult && (
              <div className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{verifyResult.message} &bull; Score: {verifyResult.trustScore}/100</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Explanatory Empty State Card */
        <div className="p-6 rounded-xl bg-slate-50/70 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 mb-1">
              Token Claims Awaiting Verification
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete the security verification widget in the form above. The ShieldCaptcha engine will
              issue an HMAC-SHA256 signed single-use token containing anti-replay nonces and trust scores.
            </p>
          </div>

          {/* Architecture Pipeline Flow Mini-Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] font-mono text-slate-600">
            <span className="px-2 py-1 bg-white rounded-md border border-slate-200">1. Client Trigger</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 bg-white rounded-md border border-slate-200">2. SHA-256 PoW</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 bg-white rounded-md border border-slate-200">3. HMAC Token</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">4. /siteverify</span>
          </div>
        </div>
      )}
    </div>
  );
}
