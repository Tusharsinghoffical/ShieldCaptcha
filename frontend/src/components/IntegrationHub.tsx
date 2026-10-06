"use client";

import React, { useState } from "react";
import { Check, Copy, Code, Terminal, Server, Download, Sparkles } from "lucide-react";

export function IntegrationHub() {
  const [frontendTab, setFrontendTab] = useState<"html" | "react">("html");
  const [backendTab, setBackendTab] = useState<"package" | "node" | "python" | "php" | "go">("package");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const snippets = {
    html: `<!-- 1. Include ShieldCaptcha Standalone SDK -->
<script src="/captcha.js"></script>

<!-- 2. Target Container in your form -->
<form id="login-form">
  <input type="email" placeholder="user@domain.com" required>
  <div id="captcha-container"></div>
  <button type="submit" id="btn-login" disabled>Sign In</button>
</form>

<script>
  let captchaToken = '';

  // Mount widget (Choose 'checkbox', 'jigsaw', or 'adaptive')
  ShieldCaptcha.mount(document.getElementById('captcha-container'), {
    mode: 'checkbox', // Checkbox 1-Click Verification
    onToken: (token, meta) => {
      captchaToken = token;
      document.getElementById('btn-login').disabled = false;
      console.log('Verified token:', token, 'score:', meta.score);
    },
    onReset: () => {
      captchaToken = '';
      document.getElementById('btn-login').disabled = true;
    }
  });

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: captchaToken })
    });
    const result = await res.json();
    alert(result.success ? 'Login Success!' : 'Verification Failed');
  };
</script>`,

    react: `import React, { useEffect, useRef, useState } from 'react';

export function ShieldCaptchaEmbed({ onToken }: { onToken: (token: string) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/captcha.js';
    script.async = true;
    script.onload = () => {
      if (boxRef.current && (window as any).ShieldCaptcha) {
        (window as any).ShieldCaptcha.mount(boxRef.current, {
          mode: 'checkbox', // 'checkbox' | 'jigsaw' | 'adaptive'
          onToken: (token: string) => onToken(token),
          onReset: () => onToken('')
        });
      }
    };
    document.body.appendChild(script);
  }, [onToken]);

  return <div ref={boxRef} style={{ minHeight: '80px', display: 'flex', justifyContent: 'center' }} />;
}`,

    package: `// 1. Install official ShieldCaptcha package:
// npm install shieldcaptcha

const express = require('express');
const { ShieldCaptcha } = require('shieldcaptcha');

const app = express();
app.use(express.json());

// Initialize with your keys from the dashboard
const captcha = new ShieldCaptcha({
  siteKey: process.env.SHIELDCAPTCHA_SITE_KEY,
  secretKey: process.env.SHIELDCAPTCHA_SECRET_KEY,
  apiUrl: 'https://shieldcaptcha.vercel.app'
});

// Protect any authentication or form endpoint
app.post('/api/login', async (req, res) => {
  const { email, password, captcha_token } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Single-line server verification
  const verification = await captcha.verify({
    token: captcha_token,
    remoteIp: clientIp
  });

  if (!verification.success) {
    return res.status(403).json({
      error: 'Captcha verification failed',
      reason: verification.error
    });
  }

  // Token valid and consumed! Proceed with login
  console.log('Verified Human Trust Score:', verification.score);
  res.json({ success: true, message: 'Welcome back!' });
});

// Or use the built-in Express middleware:
// app.post('/api/protected', captcha.middleware({ minScore: 50 }), handler);`,

    node: `// Node.js (Express) Raw HTTP Verification
const express = require('express');
const app = express();
app.use(express.json());

const SITE_SECRET = process.env.SITE_SECRET || 'sec_shield_live_secret';

app.post('/api/login', async (req, res) => {
  const { email, token } = req.body;

  // 1. Verify single-use token with ShieldCaptcha engine
  const verifyRes = await fetch('/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Secret': SITE_SECRET
    },
    body: JSON.stringify({ token, ip: req.ip })
  });

  const verdict = await verifyRes.json();
  if (!verdict.success) {
    return res.status(403).json({ error: 'CAPTCHA verification failed', reason: verdict.error });
  }

  // 2. Token authorized & consumed (Single-use replay protection)
  console.log('Biomechanical Trust Score:', verdict.trustScore);
  res.json({ success: true, message: 'Authenticated successfully' });
});`,

    python: `# Python (FastAPI) Server-Side Verification
from fastapi import FastAPI, HTTPException, Request
import httpx

app = FastAPI()
SITE_SECRET = "sec_shield_live_secret"

@app.post("/api/login")
async def login(request: Request):
    data = await request.json()
    token = data.get("token")
    client_ip = request.client.host

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://shieldcaptcha.vercel.app/api/siteverify",
            headers={"X-Site-Secret": SITE_SECRET},
            json={"token": token, "ip": client_ip}
        )
        verdict = resp.json()

    if not verdict.get("success"):
        raise HTTPException(status_code=403, detail="CAPTCHA failed")

    return {"status": "authenticated", "trustScore": verdict.get("trustScore")}`,

    php: `<?php
// PHP Token Verification
$token = $_POST['token'];
$siteSecret = 'sec_shield_live_secret';

$payload = json_encode([
    'token' => $token,
    'ip' => $_SERVER['REMOTE_ADDR']
]);

$ch = curl_init('https://shieldcaptcha.vercel.app/api/siteverify');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Site-Secret: ' . $siteSecret
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
if (!$result['success']) {
    http_response_code(403);
    echo json_encode(['error' => 'Bot challenge failed']);
    exit;
}
echo json_encode(['authenticated' => true]);`,

    go: `package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type VerifyPayload struct {
	Token string \`json:"token"\`
	IP    string \`json:"ip"\`
}

func verifyCaptcha(token, ip string) bool {
	data, _ := json.Marshal(VerifyPayload{Token: token, IP: ip})
	req, _ := http.NewRequest("POST", "https://shieldcaptcha.vercel.app/api/siteverify", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Site-Secret", "sec_shield_live_secret")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return false
	}
	defer resp.Body.Close()

	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)
	return res["success"] == true
}`
  };

  return (
    <div className="space-y-6">
      {/* Official Package Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Official Developer Package</span>
          </div>
          <h3 className="font-extrabold text-white text-base">Install `shieldcaptcha` on any laptop or server</h3>
          <p className="text-xs text-slate-300">Run <code className="bg-white/10 px-1 py-0.5 rounded text-indigo-200">npm install shieldcaptcha</code> or download the standalone package for zero-config verification.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/downloads/shieldcaptcha.zip"
            download="shieldcaptcha.zip"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Package (.zip)</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frontend Snippet Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Step 1: Frontend Widget Embed</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFrontendTab("html")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    frontendTab === "html" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  HTML / Vanilla
                </button>
                <button
                  type="button"
                  onClick={() => setFrontendTab("react")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    frontendTab === "react" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  React / Next.js
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(snippets[frontendTab], "frontend")}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
              >
                {copiedKey === "frontend" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "frontend" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 bg-[#0f172a] overflow-x-auto leading-relaxed flex-1 select-all">
            <code>{snippets[frontendTab]}</code>
          </pre>
        </div>

        {/* Backend Snippet Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Step 2: Server Verification</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300 text-[11px]">
                {(["package", "node", "python", "php", "go"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBackendTab(b)}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      backendTab === b ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {b === "package" ? "NPM Package" : b.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(snippets[backendTab], "backend")}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
              >
                {copiedKey === "backend" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "backend" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 bg-[#0f172a] overflow-x-auto leading-relaxed flex-1 select-all">
            <code>{snippets[backendTab]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
