import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.CAPTCHA_BACKEND_URL || "http://127.0.0.1:3000";

export async function proxyToBackend(req: NextRequest, endpoint: string) {
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

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      if (body) {
        init.body = body;
        const incomingContentType = req.headers.get("content-type");
        headers.set("Content-Type", incomingContentType || "application/json");
      }
    }

    const res = await fetch(url, init);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "backend_unavailable", details: error?.message || "Ensure server.js is running on port 3000" },
      { status: 502 }
    );
  }
}
