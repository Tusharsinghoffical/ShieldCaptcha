import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/keys/list");
}

export async function OPTIONS(req: NextRequest) {
  return proxyToBackend(req, "/api/keys/list");
}
