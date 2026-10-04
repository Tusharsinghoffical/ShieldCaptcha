"use client";

import React, { useState } from "react";
import { Check, Copy, Code, Terminal, Server } from "lucide-react";

export function IntegrationHub() {
  const [frontendTab, setFrontendTab] = useState<"html" | "react">("html");
  const [backendTab, setBackendTab] = useState<"node" | "python" | "php" | "go">("node");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const snippets = {
    html: `<!-- 1. Include ShieldCaptcha Standalone SDK -->
<script src="http://localhost:3000/captcha.js"></script>

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
    script.src = 'http://localhost:3000/captcha.js';
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

    node: `// Node.js (Express) Server-Side Verification
const express = require('express');
const app = express();
app.use(express.json());

const SITE_SECRET = process.env.SITE_SECRET || 'sec_shield_live_secret';

app.post('/api/login', async (req, res) => {
  const { email, token } = req.body;

  // 1. Verify single-use token with ShieldCaptcha engine
  const verifyRes = await fetch('http://localhost:3000/api/siteverify', {
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
            "http://localhost:3000/api/siteverify",
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

$payload = json_encode(['token' => $token, 'ip' => $_SERVER['REMOTE_ADDR']]);
$ch = curl_init('http://localhost:3000/api/siteverify');
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Site-Secret: ' . $siteSecret
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!$res || !$res['success']) {
    http_response_code(403);
    echo json_encode(['error' => 'Bot detected']);
    exit;
}

echo json_encode(['authorized' => true, 'score' => $res['trustScore']]);
?>`,

    go: `// Go (Golang) Token Verification
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

func VerifyCaptcha(token, clientIP, secret string) (bool, int) {
	payload, _ := json.Marshal(map[string]string{"token": token, "ip": clientIP})
	req, _ := http.NewRequest("POST", "http://localhost:3000/api/siteverify", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Site-Secret", secret)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 { return false, 0 }
	defer resp.Body.Close()

	var res struct { Success bool \`json:"success"\`; TrustScore int \`json:"trustScore"\` }
	json.NewDecoder(resp.Body).Decode(&res)
	return res.Success && res.TrustScore >= 30, res.TrustScore
}`
  };

  return (
    <div id="integration" className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Frontend Snippet Card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Step 1: Frontend Client SDK</span>
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
            <span>Step 2: Server Verification (/api/siteverify)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300 text-[11px]">
              {(["node", "python", "php", "go"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBackendTab(b)}
                  className={`px-2 py-1 rounded-md font-medium uppercase text-[10px] transition-all ${
                    backendTab === b ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {b}
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
  );
}
