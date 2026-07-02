import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimitRedis } from './lib/redis';

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Redis-backed Rate Limiter for sensitive API endpoints (Anti-DDoS / Brute Force)
  if (path.startsWith('/api/payment/') || path.startsWith('/api/user/') || path.startsWith('/api/webhook/')) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const maxAttempts = path.startsWith('/api/webhook/') ? 100 : 15;
    const windowSec = 60;
    const limitKey = `${ip}:${path}`;
    const limitCheck = await checkRateLimitRedis(limitKey, maxAttempts, windowSec);

    if (!limitCheck.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Cyber threat mitigation active.",
          retryAfter: limitCheck.retryAfter || 60
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(limitCheck.retryAfter || 60),
            'X-Content-Type-Options': 'nosniff',
          }
        }
      );
    }
  }

  // 2. Security Headers Injection (MITM, XSS, Clickjacking protection)
  const response = NextResponse.next();

  const isDev = process.env.NODE_ENV === 'development';

  // Strict Transport Security (HSTS) - forces HTTPS for MITM protection. ONLY in production!
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://checkout.razorpay.com https://*.convex.cloud wss://*.convex.cloud https://api.razorpay.com https://challenges.cloudflare.com;
    frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://challenges.cloudflare.com;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `.replace(/\s{2,}/g, ' ').trim();
  response.headers.set('Content-Security-Policy', cspHeader);

  // Anti-Clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Anti-MIME Sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (prevent hardware access / sniffing)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // DNS Prefetching Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
