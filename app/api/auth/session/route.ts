import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getServerUser();
    if (!userPayload) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: userPayload.sub,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
