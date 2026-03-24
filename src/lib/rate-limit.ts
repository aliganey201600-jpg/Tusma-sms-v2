/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window algorithm. No Redis required.
 * Resets on server restart (acceptable for Edge/Serverless with short limits).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * @param ip     - Client identifier (IP address or user ID)
 * @param limit  - Max requests allowed in the window
 * @param windowMs - Window size in milliseconds (default: 60_000 = 1 minute)
 */
export function rateLimit(ip: string, limit: number, windowMs = 60_000) {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
}

/** Gets the real client IP from Next.js request headers */
export function getClientIp(request: Request): string {
    const fwd = request.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return request.headers.get("x-real-ip") || "unknown";
}
