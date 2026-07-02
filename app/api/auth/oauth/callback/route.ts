import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  exchangeGoogleCode,
  exchangeGitHubCode,
  getGoogleProfile,
  getGitHubProfile,
  OAuthProvider,
} from "@/lib/oauth-providers";
import { createJWT, AUTH_COOKIE_NAME, getCookieConfig } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { cookies } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GET /api/auth/oauth/callback?provider=google|github&code=...&state=...
 *
 * Handles the OAuth2 callback from Google/GitHub:
 * 1. Validates the state parameter (CSRF protection via Redis)
 * 2. Exchanges the authorization code for an access token
 * 3. Fetches the user's profile from the provider
 * 4. Creates or finds the user in Convex DB
 * 5. Issues a JWT with a unique session ID (single-device enforcement)
 * 6. Stores the session in Redis
 * 7. Redirects to /browse
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/sign-in?error=invalid_callback", req.url)
    );
  }

  let provider: OAuthProvider | undefined = undefined;

  try {
    // ── Step 1: Validate state (CSRF protection) ──
    let oauthState: { provider: OAuthProvider; codeVerifier?: string } | null = null;

    if (redis) {
      const stateKey = `oauth:state:${state}`;
      const stored = await redis.get<string>(stateKey);

      if (!stored) {
        console.error("OAuth state mismatch — possible CSRF attack");
        return NextResponse.redirect(
          new URL("/sign-in?error=invalid_state", req.url)
        );
      }

      oauthState =
        typeof stored === "string" ? JSON.parse(stored) : stored;

      // Consume the state token (one-time use)
      await redis.del(stateKey);

      if (!oauthState || !oauthState.provider) {
        return NextResponse.redirect(
          new URL("/sign-in?error=invalid_state_data", req.url)
        );
      }

      provider = oauthState.provider;
    } else {
      // Fallback if Redis is down (default to google or handle gracefully)
      return NextResponse.redirect(
        new URL("/sign-in?error=redis_unavailable", req.url)
      );
    }

    // ── Step 2: Exchange code for access token ──
    let accessToken: string;

    if (provider === "google") {
      const codeVerifier = oauthState?.codeVerifier || "";
      accessToken = await exchangeGoogleCode(code, codeVerifier);
    } else {
      accessToken = await exchangeGitHubCode(code);
    }

    // ── Step 3: Fetch user profile ──
    const profile =
      provider === "google"
        ? await getGoogleProfile(accessToken)
        : await getGitHubProfile(accessToken);

    const email = profile.email.toLowerCase().trim();

    // ── Step 4: Create or find user in Convex ──
    const userId = await convex.mutation(api.users.getOrCreateByEmail, {
      email,
      name: profile.name,
    });

    // Fetch the full user record for role/premium info
    const userRecord = await convex.query(api.users.getByEmail, { email });

    // ── Step 5: Generate JWT + session ID ──
    const sid = crypto.randomUUID();

    const token = await createJWT({
      sub: String(userId),
      email,
      name: profile.name,
      role: userRecord?.role || "student",
      sid,
    });

    // ── Step 6: Store session in Redis (single-device enforcement) ──
    if (redis) {
      // This invalidates any previous session for this email
      await redis.set(`user:session:${email}`, sid);
    }

    // ── Step 7: Set cookie and redirect ──
    const isProd = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getCookieConfig(isProd));

    return NextResponse.redirect(new URL("/browse", req.url));
  } catch (err: any) {
    console.error(`OAuth callback error (${provider}):`, err);
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(err.message || "oauth_failed")}`,
        req.url
      )
    );
  }
}
