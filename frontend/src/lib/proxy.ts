import { NextRequest, NextResponse } from "next/server";
import { serverlessEngine } from "./serverless-engine";

const BACKEND_URL = process.env.CAPTCHA_BACKEND_URL || (process.env.VERCEL ? "" : "http://127.0.0.1:3000");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Site-Secret, Accept",
};

export async function proxyToBackend(req: NextRequest, endpoint: string) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // If a remote or local backend is configured, attempt proxying first
  if (BACKEND_URL) {
    try {
      const url = `${BACKEND_URL}${endpoint}`;
      const headers = new Headers();
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "host" && key.toLowerCase() !== "content-length") {
          headers.set(key, value);
        }
      });

      const init: RequestInit = {
        method: req.method,
        headers,
      };

      let bodyText = "";
      if (req.method !== "GET" && req.method !== "HEAD") {
        bodyText = await req.text();
        if (bodyText) {
          init.body = bodyText;
          const incomingContentType = req.headers.get("content-type");
          headers.set("Content-Type", incomingContentType || "application/json");
        }
      }

      // 1.5s timeout for fast fallback to serverless engine
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      init.signal = controller.signal;

      try {
        const res = await fetch(url, init);
        clearTimeout(timeoutId);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
      } catch {
        clearTimeout(timeoutId);
        // Fall through to serverless fallback below!
      }
    } catch {
      // Fall through to serverless fallback below!
    }
  }

  // Serverless Engine Execution (Vercel Production / Standalone Edge Fallback)
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // API Key Management Routes
    if (endpoint === "/api/v1/keys/list" || endpoint === "/api/keys/list") {
      const keys = serverlessEngine.listApiKeys(true);
      return NextResponse.json({ success: true, count: keys.length, keys }, { status: 200, headers: CORS_HEADERS });
    }

    if ((endpoint === "/api/v1/keys/create" || endpoint === "/api/keys/create") && req.method === "POST") {
      let body: any = {};
      try { body = await req.json(); } catch {}
      const key = serverlessEngine.createApiKey({
        name: body.name,
        allowedDomains: body.allowedDomains,
        mode: body.mode
      });
      return NextResponse.json({
        success: true,
        message: "API Key pair generated successfully. Store secretKey securely.",
        key
      }, { status: 201, headers: CORS_HEADERS });
    }

    if ((endpoint === "/api/v1/keys/revoke" || endpoint === "/api/keys/revoke") && (req.method === "POST" || req.method === "DELETE")) {
      let body: any = {};
      try { body = await req.json(); } catch {}
      const target = body.siteKey || req.nextUrl.searchParams.get("siteKey");
      if (!target) return NextResponse.json({ success: false, error: "missing_site_key" }, { status: 400, headers: CORS_HEADERS });
      const ok = serverlessEngine.revokeApiKey(target);
      return NextResponse.json({ success: ok, siteKey: target }, { status: ok ? 200 : 404, headers: CORS_HEADERS });
    }

    if (endpoint === "/api/challenge") {
      if (req.nextUrl.searchParams.get("simulate_lockout") === "true") {
        const lock = serverlessEngine.simulateIpLockout(clientIp, 300);
        return NextResponse.json({
          error: "ip_temporarily_locked",
          message: "Too many failed attempts. Access blocked for 5 minutes.",
          retryAfterSec: lock.retryAfterSec,
          lockedUntil: lock.lockedUntil
        }, { status: 429, headers: CORS_HEADERS });
      }
      if (req.nextUrl.searchParams.get("reset_lockout") === "true") {
        serverlessEngine.resetIpFails(clientIp);
        return NextResponse.json({ success: true, message: "IP lockout reset successfully" }, { status: 200, headers: CORS_HEADERS });
      }

      let mode = req.nextUrl.searchParams.get("mode") || "checkbox";
      if (req.method === "POST") {
        try {
          const body = await req.json();
          if (body?.mode) mode = body.mode;
        } catch {}
      }
      const challenge: any = serverlessEngine.createChallenge(mode, clientIp);
      const statusCode = challenge?.error === "ip_temporarily_locked" || challenge?.status === 429 ? 429 : 200;
      return NextResponse.json(challenge, { status: statusCode, headers: CORS_HEADERS });
    }

    if (endpoint === "/api/verify" && req.method === "POST") {
      let body: any = {};
      try {
        body = await req.json();
      } catch {}
      const result: any = serverlessEngine.verifySubmission(body.id, body.encrypted, clientIp, body);
      const statusCode = result?.error === "ip_temporarily_locked" ? 429 : 200;
      return NextResponse.json(result, { status: statusCode, headers: CORS_HEADERS });
    }

    if ((endpoint === "/api/siteverify" || endpoint === "/api/v1/siteverify") && req.method === "POST") {
      let body: any = {};
      try {
        body = await req.json();
      } catch {}
      const token = body.token || body.response || req.nextUrl.searchParams.get("token");
      const secret = body.secret || req.headers.get("x-site-secret") || req.nextUrl.searchParams.get("secret");
      const result = serverlessEngine.verifySiteToken(token, secret);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    if (endpoint === "/api/stats") {
      return NextResponse.json(serverlessEngine.getStats(), { status: 200, headers: CORS_HEADERS });
    }

    if (endpoint === "/api/signup" && req.method === "POST") {
      let body: any = {};
      try {
        body = await req.json();
      } catch {}
      const token = body.captcha || body.captcha_token;
      const verification = serverlessEngine.verifySiteToken(token);
      if (!verification.success) {
        return NextResponse.json({ success: false, error: "unauthorized_captcha_required" }, { status: 403, headers: CORS_HEADERS });
      }
      return NextResponse.json({
        success: true,
        message: `Authorized action successful for: ${String(body.email || "user").slice(0, 80)}`,
        trustScore: verification.score,
        authMode: verification.mode
      }, { status: 200, headers: CORS_HEADERS });
    }

    return NextResponse.json({ status: "serverless_fallback_active", endpoint }, { status: 200, headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error: "serverless_execution_error", details: err?.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
