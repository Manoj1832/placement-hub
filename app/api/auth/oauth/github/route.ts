import { NextRequest, NextResponse } from "next/server";
import { getGitHubAuthUrl, generateState } from "@/lib/oauth-providers";
import { redis } from "@/lib/redis";

/**
 * GET /api/auth/oauth/github
 *
 * Initiates GitHub OAuth2 flow:
 * 1. Generates a cryptographic state (CSRF protection)
 * 2. Stores state in Redis (60s TTL)
 * 3. Redirects user to GitHub consent screen
 */
export async function GET(req: NextRequest) {
  try {
    const state = generateState();
    const url = getGitHubAuthUrl(state);

    // Store state in Redis for callback verification
    if (redis) {
      await redis.set(
        `oauth:state:${state}`,
        JSON.stringify({ provider: "github" }),
        { ex: 300 } // 5 minutes expiry
      );
    }

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("GitHub OAuth init error:", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_init_failed", req.url)
    );
  }
}
