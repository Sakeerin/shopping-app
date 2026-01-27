import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ============================================================================
// T199: RATE LIMITING (Phase 9 - Security Hardening)
// ============================================================================

/**
 * Rate limiting configuration using Upstash Redis
 *
 * In production, set these environment variables:
 * - UPSTASH_REDIS_REST_URL: Your Upstash Redis REST URL
 * - UPSTASH_REDIS_REST_TOKEN: Your Upstash Redis REST token
 *
 * In development without Upstash, rate limiting will be disabled
 */

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Auth endpoints rate limiter
 * - 10 requests per 10 minutes per IP
 * - Strict rate limiting for login/register to prevent brute force
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      analytics: true,
      prefix: '@ratelimit/auth',
    })
  : null;

/**
 * API endpoints rate limiter
 * - 100 requests per minute per IP
 * - General purpose rate limiting for API routes
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@ratelimit/api',
    })
  : null;

/**
 * Server Actions rate limiter
 * - 60 requests per minute per IP
 * - Rate limiting for form submissions and mutations
 */
export const actionRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: '@ratelimit/action',
    })
  : null;

/**
 * Password reset rate limiter
 * - 3 requests per hour per IP
 * - Very strict rate limiting for password reset to prevent abuse
 */
export const passwordResetRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: '@ratelimit/password-reset',
    })
  : null;

/**
 * Helper function to get client identifier (IP address)
 * Falls back to a default identifier if headers are not available
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default identifier
  return 'anonymous';
}

/**
 * Check rate limit and return result
 * If rate limiting is not configured (development), allow all requests
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Rate limit response helper
 * Returns a JSON response with rate limit information
 */
export function rateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      limit,
      remaining,
      reset: new Date(reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
