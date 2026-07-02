/**
 * OAuth2 Provider Configuration
 *
 * Handles OAuth2 authorization URL generation, token exchange, and user profile
 * fetching for Google and GitHub providers. This is a manual implementation — no
 * NextAuth or third-party auth library required.
 *
 * Security features:
 * - PKCE (S256) code verifier for Google
 * - Cryptographic state parameter to prevent CSRF
 * - All secrets server-side only
 */

import crypto from "crypto";

// ── Types ────────────────────────────────────────────────────

export type OAuthProvider = "google" | "github";

export interface OAuthUserProfile {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: OAuthProvider;
  providerId: string; // unique ID from the provider
}

// ── Provider Config ──────────────────────────────────────────

const CALLBACK_BASE = process.env.NEXTAUTH_URL || "http://localhost:3000";

const PROVIDERS = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    scopes: ["openid", "email", "profile"],
    callbackUrl: `${CALLBACK_BASE}/api/auth/oauth/callback`,
  },
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    emailsUrl: "https://api.github.com/user/emails",
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    scopes: ["read:user", "user:email"],
    callbackUrl: `${CALLBACK_BASE}/api/auth/oauth/callback`,
  },
} as const;

// ── PKCE helpers (for Google) ────────────────────────────────

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return Buffer.from(hash).toString("base64url");
}

// ── State token (CSRF protection) ────────────────────────────

export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Authorization URL builders ───────────────────────────────

export async function getGoogleAuthUrl(state: string): Promise<{
  url: string;
  codeVerifier: string;
}> {
  const config = PROVIDERS.google;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  return {
    url: `${config.authUrl}?${params.toString()}`,
    codeVerifier,
  };
}

export function getGitHubAuthUrl(state: string): string {
  const config = PROVIDERS.github;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

// ── Token Exchange ───────────────────────────────────────────

export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string
): Promise<string> {
  const config = PROVIDERS.google;

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Google token exchange failed:", errText);
    throw new Error("Google token exchange failed");
  }

  const data = await res.json();
  return data.access_token;
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  const config = PROVIDERS.github;

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.callbackUrl,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("GitHub token exchange failed:", errText);
    throw new Error("GitHub token exchange failed");
  }

  const data = await res.json();

  if (data.error) {
    console.error("GitHub token error:", data.error_description);
    throw new Error(data.error_description || "GitHub token exchange failed");
  }

  return data.access_token;
}

// ── User Profile Fetching ────────────────────────────────────

export async function getGoogleProfile(
  accessToken: string
): Promise<OAuthUserProfile> {
  const config = PROVIDERS.google;

  const res = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch Google profile");

  const data = await res.json();

  return {
    email: data.email,
    name: data.name || data.email.split("@")[0],
    avatarUrl: data.picture,
    provider: "google",
    providerId: data.id,
  };
}

export async function getGitHubProfile(
  accessToken: string
): Promise<OAuthUserProfile> {
  const config = PROVIDERS.github;

  // Fetch profile
  const profileRes = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!profileRes.ok) throw new Error("Failed to fetch GitHub profile");
  const profile = await profileRes.json();

  // Fetch email (may be private)
  let email = profile.email;

  if (!email) {
    const emailsRes = await fetch(config.emailsUrl!, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      // Prefer the primary verified email
      const primary = emails.find(
        (e: any) => e.primary && e.verified
      );
      email = primary?.email || emails[0]?.email;
    }
  }

  if (!email) {
    throw new Error("Could not retrieve email from GitHub. Please ensure your GitHub email is public or verified.");
  }

  return {
    email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    provider: "github",
    providerId: String(profile.id),
  };
}
