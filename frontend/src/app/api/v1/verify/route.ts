import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/verify");
}

export async function OPTIONS(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/verify");
}
