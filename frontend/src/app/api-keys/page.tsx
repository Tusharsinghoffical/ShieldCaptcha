"use client";

import React, { useState, useEffect } from "react";
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
  Layers
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

const BACKEND_URL = process.env.NEXT_PUBLIC_CAPTCHA_API || "http://localhost:3000";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // New Key Form State
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
      // Fallback local key for offline demonstration
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
          await loadKeys();
          setSelectedKeyForTest(data.key.secretKey);
        }
      }
    } catch (err) {
      alert("Failed to create key. Ensure backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (siteKey: string) => {
    if (!confirm(`Are you sure you want to revoke API key ${siteKey}? This will invalidate authentication for forms using this key.`)) {
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
        bodyParams.append("response", testToken.trim() || "test_token_placeholder");
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
            response: testToken.trim() || "test_token_placeholder",
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

  // Code snippets for tabbed display
  const codeSnippets = {
    curl: `# Server-to-server token verification via cURL (JSON or Form-URLEncoded)
curl -X POST "${BACKEND_URL}/api/v1/siteverify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret": "${currentSecret}",
    "response": "PASTE_SUBMITTED_CAPTCHA_TOKEN_HERE",
    "remoteip": "CLIENT_IP_ADDRESS"
  }'`,

    node: `// Node.js (Fetch API or Axios) — Backend Form Verification
const verifyShieldCaptcha = async (clientToken, clientIp) => {
  const response = await fetch("${BACKEND_URL}/api/v1/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: "${currentSecret}",
      response: clientToken,
      remoteip: clientIp
    })
  });

  const data = await response.json();
  if (data.success && data.score >= 50) {
    console.log("Human verified! Score:", data.score);
    return true;
  }
  return false;
};`,

    python: `# Python (requests) — Backend Verification
import requests

def verify_token(token, client_ip=None):
    payload = {
        "secret": "${currentSecret}",
        "response": token,
        "remoteip": client_ip
    }
    res = requests.post("${BACKEND_URL}/api/v1/siteverify", json=payload, timeout=5)
    result = res.json()
    
    if result.get("success") and result.get("score", 0) >= 50:
        return True
    return False`,

    php: `<?php
// PHP — Standard cURL Server Verification
$secret = '${currentSecret}';
$token  = $_POST['captcha_token'];
$ip     = $_SERVER['REMOTE_ADDR'];

$ch = curl_init('${BACKEND_URL}/api/v1/siteverify');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'secret'   => $secret,
    'response' => $token,
    'remoteip' => $ip
]));

$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response, true);

if ($result['success'] && $result['score'] >= 50) {
    // Human confirmed! Proceed with login/signup
}
?>`,

    go: `// Golang (net/http) — Server Verification
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type VerifyReq struct {
	Secret   string \`json:"secret"\`
	Response string \`json:"response"\`
	RemoteIP string \`json:"remoteip,omitempty"\`
}

func verifyCaptcha(token, clientIP string) (bool, error) {
	reqBody, _ := json.Marshal(VerifyReq{
		Secret:   "${currentSecret}",
		Response: token,
		RemoteIP: clientIP,
	})

	resp, err := http.Post("${BACKEND_URL}/api/v1/siteverify", "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result struct {
		Success bool \`json:"success"\`
		Score   int  \`json:"score"\`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	return result.Success && result.Score >= 50, nil
}`
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-10">
        {/* Header Hero Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Key className="w-3.5 h-3.5" />
              Developer API &amp; Token Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise API Keys &amp; Server-to-Server Gateway
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
              Generate public Site Keys and private Secret Keys to protect your web apps. Validate human verification
              tokens directly from your backend using our RFC-compliant REST API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`${BACKEND_URL}/api/v1/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              OpenAPI 3.0 Spec
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              onClick={loadKeys}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Keys
            </button>
          </div>
        </div>

        {/* Newly Created Key Modal Banner */}
        {createdNotification && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  New API Key Pair Generated Successfully
                </div>
                <p className="text-xs text-emerald-700">
                  Store your Secret Key securely. It authorizes server-to-server token validation.
                </p>
              </div>
              <button
                onClick={() => setCreatedNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-200/60">
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Public Site Key (Frontend)
                </div>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">
                  <span className="truncate">{createdNotification.siteKey}</span>
                  <button
                    onClick={() => handleCopy(createdNotification.siteKey, "notif_site")}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0"
                    title="Copy Site Key"
                  >
                    {copiedKey === "notif_site" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Private Secret Key (Backend Only)
                </div>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">
                  <span className="truncate">{createdNotification.secretKey}</span>
                  <button
                    onClick={() => handleCopy(createdNotification.secretKey, "notif_sec")}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "notif_sec" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Grid: Key Generation & Active Keys */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Create New Key Form (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Plus className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">Generate API Key Pair</h2>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Name</label>
                <input
                  type="text"
                  placeholder="e.g., My SaaS Portal"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allowed Domains (Comma separated)</label>
                <input
                  type="text"
                  placeholder="localhost, mysite.com"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Use <code>*</code> to permit all domains during testing.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Challenge Mode</label>
                <select
                  value={challengeMode}
                  onChange={(e: any) => setChallengeMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs bg-white"
                >
                  <option value="adaptive">Adaptive Auto Step-Up (Recommended)</option>
                  <option value="checkbox">1-Click Smart Checkbox Only</option>
                  <option value="jigsaw">Anti-CV Jigsaw Slider Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !appName.trim()}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Cryptographic Pair...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Key Pair
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Active Keys Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">Registered API Keys</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  {keys.length} Active
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                Loading registered keys from backend...
              </div>
            ) : keys.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active keys found. Use the generator on the left to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => {
                  const isVisible = showSecret[k.siteKey];
                  const secretDisplay = isVisible ? k.secretKey : (k.secretKeyMasked || "sec_shield_••••••••••••••••");

                  return (
                    <div
                      key={k.siteKey}
                      className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-all bg-slate-50/50 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{k.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                            {k.mode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Site Key & Secret Key display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Site Key */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Site Key (Public)
                          </div>
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-800">
                            <span className="truncate">{k.siteKey}</span>
                            <button
                              onClick={() => handleCopy(k.siteKey, `list_site_${k.siteKey}`)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
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
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Secret Key (Private)</span>
                            <button
                              onClick={() => setShowSecret((prev) => ({ ...prev, [k.siteKey]: !prev[k.siteKey] }))}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title={isVisible ? "Hide Secret" : "Show Secret"}
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-800">
                            <span className="truncate">{secretDisplay}</span>
                            <button
                              onClick={() => handleCopy(k.secretKey, `list_sec_${k.siteKey}`)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
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

                      {/* Footer Info Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                        <div>
                          <strong>Domains:</strong> {k.allowedDomains.join(", ")}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedKeyForTest(k.secretKey);
                              const target = document.getElementById("playground");
                              target?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Use in Test Console →
                          </button>
                          {k.name !== "Default Root Key" && (
                            <button
                              onClick={() => handleRevokeKey(k.siteKey)}
                              className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Interactive API Playground & Multi-Language Snippets */}
        <div id="playground" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <Terminal className="w-3.5 h-3.5" />
                Live API Playground
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Server-to-Server Verification (<code>POST /api/v1/siteverify</code>)
              </h2>
            </div>

            {/* Language Code Selector Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
              {(["curl", "node", "python", "php", "go"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    activeCodeTab === lang ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Snippet Box */}
          <div className="relative bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Ready-to-use Implementation Snippet</span>
              <button
                onClick={() => handleCopy(codeSnippets[activeCodeTab], `snippet_${activeCodeTab}`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedKey === `snippet_${activeCodeTab}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="leading-relaxed whitespace-pre">{codeSnippets[activeCodeTab]}</pre>
          </div>

          {/* Live Request Tester Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                Live Request Console
              </h3>
              <span className="text-xs text-slate-500">
                Endpoint: <code className="text-indigo-600 font-semibold">{BACKEND_URL}/api/v1/siteverify</code>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secret Key</label>
                <select
                  value={selectedKeyForTest}
                  onChange={(e) => setSelectedKeyForTest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono"
                >
                  {keys.map((k) => (
                    <option key={k.siteKey} value={k.secretKey}>
                      {k.name} ({k.secretKey.slice(0, 12)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Response Token (or Placeholder)</label>
                <input
                  type="text"
                  placeholder="Paste token or leave empty for test"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payload Format</label>
                <div className="flex items-center gap-4 py-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fmt"
                      checked={testFormat === "json"}
                      onChange={() => setTestFormat("json")}
                      className="text-indigo-600"
                    />
                    <span>application/json</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fmt"
                      checked={testFormat === "urlencoded"}
                      onChange={() => setTestFormat("urlencoded")}
                      className="text-indigo-600"
                    />
                    <span>x-www-form-urlencoded</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Tests atomic consumption, cryptographic signature, and score delivery.
              </span>
              <button
                onClick={handleRunVerifyTest}
                disabled={isTesting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                Execute API Call
              </button>
            </div>

            {/* Test Results Output */}
            {testResponse && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        testResponse.status === 200
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      HTTP {testResponse.status}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{testDuration} ms</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Response Payload</span>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                  {JSON.stringify(testResponse.data || testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Token Inspector Utility */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Token Inspector &amp; Signature Auditor</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Paste any ShieldCaptcha token here to verify its cryptographic HMAC-SHA256 signature, decrypt inner claims,
            check expiration status, and ensure it has not been tampered with or replayed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Paste token (e.g., eyJhbGci... or base64url.signature)"
              value={inspectTokenInput}
              onChange={(e) => setInspectTokenInput(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleInspectToken}
              disabled={inspectLoading || !inspectTokenInput.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {inspectLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Inspect Token
            </button>
          </div>

          {inspectResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center gap-2">
                {inspectResult.valid ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Valid &amp; Unconsumed Token
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Invalid, Expired, or Replayed Token ({inspectResult.reason || inspectResult.error || "failed"})
                  </div>
                )}
              </div>

              {inspectResult.payload && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Trust Score</span>
                    <strong className="text-sm text-indigo-600">{inspectResult.payload.score}/100</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Mode</span>
                    <strong className="text-sm text-slate-800">{inspectResult.payload.mode}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">TTL Remaining</span>
                    <strong className="text-sm text-slate-800">{inspectResult.payload.ttlRemainingSec}s</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Consumed</span>
                    <strong className={`text-sm ${inspectResult.consumed ? "text-rose-600" : "text-emerald-600"}`}>
                      {inspectResult.consumed ? "Yes (Spent)" : "No (Fresh)"}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
