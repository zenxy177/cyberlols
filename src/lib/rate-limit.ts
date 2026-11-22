type RateLimitRecord = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Sliding window rate limiter for endpoint protection against DoS and abusive requests.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();

  // Prune expired entries to prevent memory leak
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    }
  }

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, retryAfterSeconds: 0 };
}

export function resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

export function getClientIp(req?: Request): string {
  if (!req) return "unknown";
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ip = xForwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

// Throttled logging to prevent disk/log flooding
const logThrottleMap = new Map<string, number>();
export function logThrottledWarn(key: string, message: string, detail?: unknown) {
  const now = Date.now();
  const last = logThrottleMap.get(key) || 0;
  if (now - last > 30000) {
    logThrottleMap.set(key, now);
    if (detail !== undefined) {
      console.warn(message, detail);
    } else {
      console.warn(message);
    }
  }
}

export function logThrottledError(key: string, message: string, detail?: unknown) {
  const now = Date.now();
  const last = logThrottleMap.get(key) || 0;
  if (now - last > 30000) {
    logThrottleMap.set(key, now);
    if (detail !== undefined) {
      console.error(message, detail);
    } else {
      console.error(message);
    }
  }
}
