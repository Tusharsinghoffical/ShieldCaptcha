"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Key,
  Shield,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Terminal,
  Code2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Server,
  ArrowRight,
  ExternalLink,
  Layers,
  Lock,
  Cpu,
  FileCode,
  Zap,
  Globe,
  HelpCircle,
  CheckSquare,
  Sliders,
  Send,
  Clock,
  Fingerprint,
  Download,
  X
} from "lucide-react";

interface ApiKeyItem {
  siteKey: string;
  secretKey: string;
  secretKeyMasked?: string;
  name: string;
  allowedDomains: string[];
  mode: string;
  createdAt: string;
  totalRequests: number;
  active: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_CAPTCHA_API || "";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"keys" | "playground" | "snippets" | "inspector">("keys");

  // Key Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [appName, setAppName] = useState("");
  const [domains, setDomains] = useState("localhost, example.com");
  const [challengeMode, setChallengeMode] = useState<"adaptive" | "checkbox" | "jigsaw">("adaptive");
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdNotification, setCreatedNotification] = useState<ApiKeyItem | null>(null);

  // Playground & API Tester State
  const [selectedKeyForTest, setSelectedKeyForTest] = useState<string>("");
  const [testToken, setTestToken] = useState("");
  const [testRemoteIp, setTestRemoteIp] = useState("127.0.0.1");
  const [testFormat, setTestFormat] = useState<"json" | "urlencoded">("json");
  const [isTesting, setIsTesting] = useState(false);
  const [isGeneratingMockToken, setIsGeneratingMockToken] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "node" | "python" | "php" | "go">("curl");

  // Token Inspector State
  const [inspectTokenInput, setInspectTokenInput] = useState("");
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);

  // Fetch keys on load
  const loadKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/keys/list`);
      if (res.ok) {
        const data = await res.json();
        if (data.keys) {
          setKeys(data.keys);
          if (data.keys.length > 0 && !selectedKeyForTest) {
            setSelectedKeyForTest(data.keys[0].secretKey);
          }
        }
      }
    } catch {
      // Fallback key
      setKeys([
        {
          siteKey: "pub_shield_live_demo_sitekey",
          secretKey: "sec_shield_live_demo_secretkey",
          name: "Default Web Client",
          allowedDomains: ["*"],
          mode: "adaptive",
          createdAt: new Date().toISOString(),
          totalRequests: 142,
          active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    try {
      setIsGenerating(true);
      const domainList = domains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const res = await fetch(`${BACKEND_URL}/api/v1/keys/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: appName.trim(),
          allowedDomains: domainList.length > 0 ? domainList : ["*"],
          mode: challengeMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.key) {
          setCreatedNotification(data.key);
          setAppName("");
          setDomains("localhost, example.com");
          setShowCreateModal(false);
          await loadKeys();
          setSelectedKeyForTest(data.key.secretKey);
        }
      }
    } catch {
      alert("Failed to create key. Ensure ShieldCaptcha backend is running on port 3000.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (siteKey: string) => {
    if (!confirm(`Are you sure you want to revoke API key ${siteKey}? Verification requests using this key will immediately fail.`)) {
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/keys/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteKey })
      });
      if (res.ok) {
        await loadKeys();
      }
    } catch {
      alert("Error revoking key.");
    }
  };

  // Helper to obtain a real fresh solved token from backend for instant testing
  const handleGenerateFreshToken = async () => {
    try {
      setIsGeneratingMockToken(true);
      const targetSiteKey = keys.find((k) => k.secretKey === selectedKeyForTest)?.siteKey || keys[0]?.siteKey || "pub_shield_default";

      // 1. Request challenge
      const chalRes = await fetch(`${BACKEND_URL}/api/v1/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteKey: targetSiteKey, mode: "checkbox" })
      });
      const chal = await chalRes.json();
      if (!chal.id) throw new Error("Could not fetch challenge");

      // 2. Solve PoW in browser
      let nonce = 0;
      while (true) {
        const str = `${chal.prefix}:${nonce}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuf = await crypto.subtle.digest("SHA-256", data);
        const hashArr = new Uint8Array(hashBuf);
        let zeros = 0;
        for (let i = 0; i < hashArr.length; i++) {
          if (hashArr[i] === 0) zeros += 8;
          else {
            zeros += Math.clz32(hashArr[i]) - 24;
            break;
          }
        }
        if (zeros >= (chal.bits || 16)) break;
        nonce++;
        if (nonce > 500000) break;
      }

      // Small delay
      await new Promise((r) => setTimeout(r, 120));

      // 3. Verify solution and get real token
      const verRes = await fetch(`${BACKEND_URL}/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: chal.id,
          nonce: nonce,
          powDuration: 120,
          trustedEvent: true,
          clickLatencyMs: 140,
          env: { isHeadless: false },
          interaction: { syntheticEventRatio: 0 }
        })
      });
      const ver = await verRes.json();

      if (ver.token) {
        setTestToken(ver.token);
        setInspectTokenInput(ver.token);
      } else {
        alert("Verification challenge rejected: " + (ver.reason || "unknown"));
      }
    } catch (err: any) {
      alert("Error generating live token: " + err.message);
    } finally {
      setIsGeneratingMockToken(false);
    }
  };

  // Run Live Verification Test
  const handleRunVerifyTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    const start = performance.now();

    try {
      const secretToUse = selectedKeyForTest || keys[0]?.secretKey || "sec_shield_demo";
      let res: Response;

      if (testFormat === "urlencoded") {
        const bodyParams = new URLSearchParams();
        bodyParams.append("secret", secretToUse);
        bodyParams.append("response", testToken.trim() || "sample_test_token");
        if (testRemoteIp.trim()) bodyParams.append("remoteip", testRemoteIp.trim());

        res = await fetch(`${BACKEND_URL}/api/v1/siteverify`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: bodyParams.toString()
        });
      } else {
        res = await fetch(`${BACKEND_URL}/api/v1/siteverify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: secretToUse,
            response: testToken.trim() || "sample_test_token",
            remoteip: testRemoteIp.trim() || undefined
          })
        });
      }

      const duration = Math.round(performance.now() - start);
      setTestDuration(duration);

      const json = await res.json();
      setTestResponse({ status: res.status, data: json });
    } catch (err: any) {
      setTestDuration(Math.round(performance.now() - start));
      setTestResponse({ status: 500, error: err.message || "Network error contacting backend" });
    } finally {
      setIsTesting(false);
    }
  };

  // Run Token Inspector
  const handleInspectToken = async () => {
    if (!inspectTokenInput.trim()) return;
    setInspectLoading(true);
    setInspectResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/token/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inspectTokenInput.trim() })
      });
      const data = await res.json();
      setInspectResult(data);
    } catch (err: any) {
      setInspectResult({ valid: false, error: err.message || "Failed to inspect token" });
    } finally {
      setInspectLoading(false);
    }
  };

  const currentSecret = selectedKeyForTest || keys[0]?.secretKey || "sec_shield_your_secret_key";
  const currentSite = keys.find((k) => k.secretKey === currentSecret)?.siteKey || keys[0]?.siteKey || "pub_shield_your_site_key";

  // Filtered keys
  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.siteKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.allowedDomains.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Multi-language code snippets
  const codeSnippets = {
    curl: `# 1. Backend Token Verification via cURL (Standard RFC format)
curl -X POST "${BACKEND_URL}/api/v1/siteverify" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "secret=${currentSecret}&response=SUBMITTED_CAPTCHA_TOKEN&remoteip=USER_IP"`,

    node: `// 2. Node.js (Express / Fastify / Next.js API)
import express from 'express';
const app = express();

app.post('/api/login', async (req, res) => {
  const { username, password, captcha_token } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Verify ShieldCaptcha token server-to-server
  const verifyRes = await fetch("${BACKEND_URL}/api/v1/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: "${currentSecret}",
      response: captcha_token,
      remoteip: clientIp
    })
  });

  const result = await verifyRes.json();
  if (!result.success || result.score < 50) {
    return res.status(403).json({ error: "Captcha verification failed", codes: result['error-codes'] });
  }

  // Verification passed! Continue with login
  res.json({ success: true, user: username, trustScore: result.score });
});`,

    python: `# 3. Python (FastAPI / Django / Flask)
import requests
from fastapi import FastAPI, HTTPException, Request

app = FastAPI()

SHIELD_SECRET = "${currentSecret}"

@app.post("/login")
async def login(request: Request, captcha_token: str):
    client_ip = request.client.host
    
    # Server-to-server verification call
    response = requests.post(
        "${BACKEND_URL}/api/v1/siteverify",
        data={
            "secret": SHIELD_SECRET,
            "response": captcha_token,
            "remoteip": client_ip
        },
        timeout=4
    )
    result = response.json()
    
    if not result.get("success") or result.get("score", 0) < 50:
        raise HTTPException(status_code=403, detail="Bot activity detected")
        
    return {"status": "authenticated", "score": result.get("score")}`,

    php: `<?php
// 4. PHP — Server-Side Form Validation
$secretKey = '${currentSecret}';
$captchaToken = $_POST['captcha_token'] ?? '';
$userIp = $_SERVER['REMOTE_ADDR'] ?? '';

$ch = curl_init('${BACKEND_URL}/api/v1/siteverify');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'secret'   => $secretKey,
        'response' => $captchaToken,
        'remoteip' => $userIp
    ]),
    CURLOPT_TIMEOUT => 4
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!$data || empty($data['success']) || $data['score'] < 50) {
    http_response_code(403);
    echo json_encode(['error' => 'Human verification failed.']);
    exit;
}

// Token validated! Proceed safely.
echo json_encode(['success' => true, 'score' => $data['score']]);
?>`,

    go: `// 5. Golang — Server Verification Handler
package main

import (
	"encoding/json"
	"net/http"
	"net/url"
)

const ShieldSecret = "${currentSecret}"

func verifyShieldCaptcha(token, clientIP string) (bool, int) {
	resp, err := http.PostForm("${BACKEND_URL}/api/v1/siteverify", url.Values{
		"secret":   {ShieldSecret},
		"response": {token},
		"remoteip": {clientIP},
	})
	if err != nil {
		return false, 0
	}
	defer resp.Body.Close()

	var res struct {
		Success bool \`json:"success"\`
		Score   int  \`json:"score"\`
	}
	json.NewDecoder(resp.Body).Decode(&res)
	return res.Success && res.Score >= 50, res.Score
}`
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Executive Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1.5">
              <Link href="/" className="hover:text-indigo-800 transition-colors">
                ShieldCaptcha Enterprise
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Developer Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Key className="w-7 h-7 text-indigo-600" />
              <span>Developer API &amp; Key Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Create and manage Site Keys and Secret Keys. Verify visitor tokens directly from your backend with standard
              RFC compatibility and zero third-party cloud dependencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/downloads/shieldcaptcha.zip"
              download="shieldcaptcha.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Package (.zip)
            </a>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate New Key
            </button>
          </div>
        </div>

        {/* Download & Multi-System Package Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Multi-System &amp; Laptop Deployment Ready</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Download ShieldCaptcha Package for Any Laptop or Server
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Download the complete standalone package or install via NPM on another laptop. Once installed, it automatically displays your machine information. Then simply paste your API keys from below to verify instantly!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/downloads/shieldcaptcha.zip"
                download="shieldcaptcha.zip"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Package (.zip)</span>
              </a>
              <a
                href="/downloads/shieldcaptcha-4.2.0.tgz"
                download="shieldcaptcha-4.2.0.tgz"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>NPM Tarball (.tgz)</span>
              </a>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-800/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <div className="font-bold text-indigo-300 mb-1">1. Download &amp; Extract</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Download the package on your other laptop and run <code className="text-indigo-200 bg-white/10 px-1 py-0.5 rounded">npm install</code> to see your system details.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <div className="font-bold text-indigo-300 mb-1">2. Copy API Keys</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Copy your Site Key and Secret Key from below and run <code className="text-indigo-200 bg-white/10 px-1 py-0.5 rounded">npx shieldcaptcha configure</code>.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <div className="font-bold text-indigo-300 mb-1">3. Live Verification &amp; Demo</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Run <code className="text-indigo-200 bg-white/10 px-1 py-0.5 rounded">npx shieldcaptcha test</code> or <code className="text-indigo-200 bg-white/10 px-1 py-0.5 rounded">npx shieldcaptcha demo</code> to test in your browser!
              </p>
            </div>
          </div>
        </div>

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Active Keys</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{keys.length} Registered</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Engine Status</div>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online (Port 3000)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Encryption</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">AES-128-CBC + PoW</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-purple-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Protocol</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">RFC Compatible</div>
            </div>
          </div>
        </div>

        {/* Success Alert Banner for Newly Created Key */}
        {createdNotification && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Pair &quot;{createdNotification.name}&quot; Generated Successfully
                </div>
                <p className="text-xs text-emerald-700">
                  Save your Secret Key securely in your environment variables. It authorizes server-to-server token
                  verification.
                </p>
              </div>
              <button
                onClick={() => setCreatedNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-emerald-200/60 text-xs">
              <div className="bg-white p-3 rounded-lg border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Site Key (Frontend Embed)
                </span>
                <div className="flex items-center justify-between font-mono bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="truncate text-slate-800">{createdNotification.siteKey}</span>
                  <button
                    onClick={() => handleCopy(createdNotification.siteKey, "notif_site")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 shrink-0 ml-2"
                    title="Copy Site Key"
                  >
                    {copiedKey === "notif_site" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Secret Key (Backend Only)
                </span>
                <div className="flex items-center justify-between font-mono bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="truncate text-slate-800">{createdNotification.secretKey}</span>
                  <button
                    onClick={() => handleCopy(createdNotification.secretKey, "notif_sec")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 shrink-0 ml-2"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "notif_sec" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("keys")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "keys"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Keys &amp; Applications ({keys.length})
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "playground"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Interactive API Tester
          </button>

          <button
            onClick={() => setActiveTab("snippets")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "snippets"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code Integration SDKs
          </button>

          <button
            onClick={() => setActiveTab("inspector")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "inspector"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Token Claims Inspector
          </button>
        </div>

        {/* TAB 1: API KEYS LIST */}
        {activeTab === "keys" && (
          <div className="space-y-4">
            {/* Search and Action Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter keys by name, site key, or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={loadKeys}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Key
                </button>
              </div>
            </div>

            {/* Keys Table / Cards */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 shadow-2xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                Loading registered credentials...
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-500 text-xs shadow-2xs">
                No API keys matched your search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredKeys.map((k) => {
                  const isVisible = showSecret[k.siteKey];
                  const secretDisplay = isVisible ? k.secretKey : (k.secretKeyMasked || "sec_shield_••••••••••••••••");

                  return (
                    <div
                      key={k.siteKey}
                      className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all space-y-4"
                    >
                      {/* Top Header of the Key Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-slate-900 text-sm">{k.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                            Mode: {k.mode}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                          {k.name !== "Default Root Key" && (
                            <button
                              onClick={() => handleRevokeKey(k.siteKey)}
                              className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Keys Display Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Site Key */}
                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Public Site Key (Client HTML / SDK)</span>
                            <span className="text-[10px] text-slate-400 lowercase font-normal">Safe in client frontend</span>
                          </div>
                          <div className="flex items-center justify-between font-mono bg-white p-2 rounded border border-slate-200">
                            <span className="truncate text-slate-800 select-all">{k.siteKey}</span>
                            <button
                              onClick={() => handleCopy(k.siteKey, `list_site_${k.siteKey}`)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 shrink-0 ml-2"
                              title="Copy Site Key"
                            >
                              {copiedKey === `list_site_${k.siteKey}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Secret Key */}
                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Private Secret Key (Server Backend)</span>
                            <button
                              onClick={() => setShowSecret((prev) => ({ ...prev, [k.siteKey]: !prev[k.siteKey] }))}
                              className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 text-[10px] font-medium"
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{isVisible ? "Hide" : "Show"}</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between font-mono bg-white p-2 rounded border border-slate-200">
                            <span className="truncate text-slate-800 select-all">{secretDisplay}</span>
                            <button
                              onClick={() => handleCopy(k.secretKey, `list_sec_${k.siteKey}`)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 shrink-0 ml-2"
                              title="Copy Secret Key"
                            >
                              {copiedKey === `list_sec_${k.siteKey}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer Details & Action Shortcut */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            <strong>Allowed Domains:</strong> {k.allowedDomains.join(", ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              handleCopy(
                                `NEXT_PUBLIC_SHIELD_SITE_KEY="${k.siteKey}"\nSHIELD_SECRET_KEY="${k.secretKey}"`,
                                `env_${k.siteKey}`
                              );
                            }}
                            className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
                          >
                            {copiedKey === `env_${k.siteKey}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied .env!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy for .env</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedKeyForTest(k.secretKey);
                              setActiveTab("playground");
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                          >
                            <span>Test in Console</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE API TESTER */}
        {activeTab === "playground" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  API Testing Studio
                </div>
                <h2 className="text-xl font-bold text-slate-900">Live Server-to-Server Token Verification</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Test <code>POST /api/v1/siteverify</code> in real-time. Verify signatures, single-use token consumption,
                  and score ratings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateFreshToken}
                  disabled={isGeneratingMockToken}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingMockToken ? "animate-spin" : ""}`} />
                  {isGeneratingMockToken ? "Solving Live Challenge..." : "Generate Live Solved Token"}
                </button>
              </div>
            </div>

            {/* Request Builder Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Secret Key (Backend Auth)</label>
                <select
                  value={selectedKeyForTest}
                  onChange={(e) => setSelectedKeyForTest(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {keys.map((k) => (
                    <option key={k.siteKey} value={k.secretKey}>
                      {k.name} ({k.secretKey.slice(0, 14)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Response Token</label>
                <input
                  type="text"
                  placeholder="Paste token or click 'Generate Live Solved Token' above"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">End-User IP (remoteip)</label>
                <input
                  type="text"
                  placeholder="e.g., 127.0.0.1 (optional)"
                  value={testRemoteIp}
                  onChange={(e) => setTestRemoteIp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Payload Format & Endpoint bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-600">Payload Format:</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="fmt_choice"
                    checked={testFormat === "json"}
                    onChange={() => setTestFormat("json")}
                    className="text-indigo-600"
                  />
                  <span>application/json</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="fmt_choice"
                    checked={testFormat === "urlencoded"}
                    onChange={() => setTestFormat("urlencoded")}
                    className="text-indigo-600"
                  />
                  <span>application/x-www-form-urlencoded</span>
                </label>
              </div>

              <button
                onClick={handleRunVerifyTest}
                disabled={isTesting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send API Verification Call
              </button>
            </div>

            {/* Response Viewer */}
            {testResponse && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        testResponse.status === 200
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {testResponse.status} {testResponse.status === 200 ? "OK" : "ERROR"}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Latency: {testDuration} ms</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">JSON Response</span>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  {JSON.stringify(testResponse.data || testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CODE INTEGRATION SNIPPETS */}
        {activeTab === "snippets" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  Ready-to-Use SDK Implementations
                </div>
                <h2 className="text-xl font-bold text-slate-900">Backend Verification Snippets</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Copy and paste directly into your project. All snippets are pre-populated with your active Secret Key.
                </p>
              </div>

              {/* Language Selector Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
                {(["curl", "node", "python", "php", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeTab(lang)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      activeCodeTab === lang
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Box */}
            <div className="relative bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-[11px] text-slate-400">
                <span>Implementation Example: {activeCodeTab.toUpperCase()}</span>
                <button
                  onClick={() => handleCopy(codeSnippets[activeCodeTab], `snip_${activeCodeTab}`)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                >
                  {copiedKey === `snip_${activeCodeTab}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="leading-relaxed whitespace-pre font-mono text-slate-200">{codeSnippets[activeCodeTab]}</pre>
            </div>
          </div>
        )}

        {/* TAB 4: TOKEN CLAIMS INSPECTOR */}
        {activeTab === "inspector" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <Search className="w-3.5 h-3.5" />
                Token Auditor
              </div>
              <h2 className="text-xl font-bold text-slate-900">Cryptographic Token Inspector</h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect signed verification tokens without consuming their single-use state. Verify HMAC-SHA256 signature,
                sub claims, and expiration countdown.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Paste token (e.g. eyJqdGki... or raw signed JWT)"
                value={inspectTokenInput}
                onChange={(e) => setInspectTokenInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleInspectToken}
                disabled={inspectLoading || !inspectTokenInput.trim()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inspectLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Decode Token Claims
              </button>
            </div>

            {inspectResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {inspectResult.valid ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Valid Cryptographic Signature &amp; Fresh State
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Invalid or Expired Token ({inspectResult.reason || inspectResult.error || "failed"})
                      </span>
                    )}
                  </div>
                </div>

                {inspectResult.payload && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Trust Score</span>
                      <strong className="text-lg text-indigo-600 font-mono">
                        {inspectResult.payload.score}/100
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Challenge Mode</span>
                      <strong className="text-sm text-slate-800 font-mono block mt-1">
                        {inspectResult.payload.mode}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">TTL Remaining</span>
                      <strong className="text-sm text-slate-800 font-mono block mt-1">
                        {inspectResult.payload.ttlRemainingSec} seconds
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Consumption State</span>
                      <strong
                        className={`text-sm font-mono block mt-1 ${
                          inspectResult.consumed ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"
                        }`}
                      >
                        {inspectResult.consumed ? "Already Consumed" : "Fresh (Unused)"}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Generate New Key Pair */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Generate New API Key Pair</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production Web App, Mobile Client"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Allowed Domains (Origin Whitelist)
                  </label>
                  <input
                    type="text"
                    placeholder="localhost, mydomain.com"
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Comma separated. Use <code>*</code> to permit all origins during local development.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Challenge Mode</label>
                  <select
                    value={challengeMode}
                    onChange={(e: any) => setChallengeMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs bg-white"
                  >
                    <option value="adaptive">Adaptive Step-Up (Smart PoW escalating to Jigsaw on risk)</option>
                    <option value="checkbox">1-Click Smart Checkbox Only (&lt;50ms solve)</option>
                    <option value="jigsaw">Anti-CV Jigsaw Slider Only (Biomechanical Defense)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !appName.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Generate Keys
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
