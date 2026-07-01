import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use Clerk for authentication." }, { status: 410 });
}
