import { NextRequest, NextResponse } from "next/server";
import { serverlessEngine } from "@/lib/serverless-engine";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const tokenHeader = req.headers.get("x-health-token") || req.headers.get("x-internal-token");
  const authHeader = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const tokenQuery = url.searchParams.get("token") || url.searchParams.get("secret") || url.searchParams.get("key");
  const isDeepRequested = url.searchParams.get("deep") === "true";

  const tokenProvided = tokenHeader || authHeader || tokenQuery;
  const isAuthorized = serverlessEngine.isHealthAuthorized(tokenProvided);

  // Return deep diagnostics if authorized or if ?deep=true with key
  const report = serverlessEngine.getHealthReport(isAuthorized || (isDeepRequested && isAuthorized));

  return NextResponse.json(report, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Engine": "ShieldCaptcha-Enterprise",
      "X-Health-Status": "healthy"
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Health-Status": "healthy",
      "X-Engine": "ShieldCaptcha-Enterprise"
    }
  });
}
