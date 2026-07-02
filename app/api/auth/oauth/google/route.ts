import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, generateState } from "@/lib/oauth-providers";
import { redis } from "@/lib/redis";

/**
 * GET /api/auth/oauth/google
 *
 * Initiates Google OAuth2 flow:
 * 1. Generates a cryptographic state (CSRF protection)
 * 2. Generates PKCE code verifier + challenge
 * 3. Stores state + code_verifier in Redis (60s TTL)
 * 4. Redirects user to Google consent screen
 */
export async function GET(req: NextRequest) {
  try {
    const state = generateState();
    const { url, codeVerifier } = await getGoogleAuthUrl(state);

    // Store state + code verifier in Redis for callback verification
    if (redis) {
      await redis.set(
        `oauth:state:${state}`,
        JSON.stringify({ provider: "google", codeVerifier }),
        { ex: 300 } // 5 minutes expiry
      );
    }

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Google OAuth init error:", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_init_failed", req.url)
    );
  }
}
