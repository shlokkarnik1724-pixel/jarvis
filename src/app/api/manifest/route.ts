import { NextResponse } from "next/server";
import { AGENT_SYSTEM_MANIFEST } from "@/lib/manifest";

export async function GET() {
  return NextResponse.json(AGENT_SYSTEM_MANIFEST);
}
