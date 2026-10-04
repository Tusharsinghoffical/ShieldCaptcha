import { NextRequest } from "next/server";
import { GET as healthGet, HEAD as healthHead } from "@/app/api/health/route";

export async function GET(req: NextRequest) {
  return healthGet(req);
}

export async function HEAD() {
  return healthHead();
}
