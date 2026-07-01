import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: userId,
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "PSG Student",
        email: user.emailAddresses[0]?.emailAddress || "",
        role: "student",
      },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
