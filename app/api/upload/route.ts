import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "File upload disabled - configure Cloudflare R2 to enable" }, { status: 501 });
}