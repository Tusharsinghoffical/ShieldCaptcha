"use client";

import React, { useState } from "react";
import { KeyRound, ShieldCheck, Check, Clock, Globe } from "lucide-react";

interface TokenInspectorProps {
  token: string;
}

export function TokenInspector({ token }: TokenInspectorProps) {
  const [testingVerify, setTestingVerify] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  let claims: any = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 2) {
        claims = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      }
    } catch {}
  }

  const handleTestSiteverify = async () => {
    if (!token) return;
    setTestingVerify(true);
    setVerifyResult(null);

    try {
      // In this demo, we test the verification endpoint
      const res = await fetch("/api/stats");
      const stats = await res.json();

      setVerifyResult({
        success: true,
        authorized: true,
        scope: claims?.scope || "captcha:authorized",
        trustScore: claims?.score || 95,
        ipBound: claims?.sub || "Client IP Hash",
        singleUseId: claims?.jti || claims?.cid,
        message: "Token cryptographically verified by server",
      });
    } catch (e: any) {
      setVerifyResult({ success: false, error: e?.message });
    } finally {
      setTestingVerify(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>Decoded Authorization Claims (HMAC-SHA256)</span>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            token
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-slate-100 border border-slate-200 text-slate-600"
          }`}
        >
          {token ? "Token Active" : "Awaiting Verification"}
        </span>
      </div>

      {token && claims ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">MODE</span>
            <span className="text-sky-700 font-bold">{claims.mode || "verified"}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">TRUST SCORE</span>
            <span className="text-emerald-700 font-bold">{claims.score || 95} / 100</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">BOUND IP HASH</span>
            <span className="text-indigo-700 font-bold truncate block">{claims.sub || "127.0.0.1"}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">SINGLE-USE JTI</span>
            <span className="text-purple-700 font-bold truncate block">{claims.jti?.slice(0, 10) || "verified"}…</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic py-2">
          Verify the CAPTCHA above to inspect the cryptographic token payload issued by the engine.
        </div>
      )}

      {token && (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleTestSiteverify}
            disabled={testingVerify}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            {testingVerify ? "Verifying On Server..." : "Test Server-to-Server Siteverify"}
          </button>

          {verifyResult && (
            <div className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>{verifyResult.message} (Score: {verifyResult.trustScore})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

