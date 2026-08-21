type Attempt = { count: number; resetAt: number; blockedUntil: number };

const attempts = new Map<string, Attempt>();

function clientAddress(request: Request) {
  return (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
}

export function rateLimitKey(request: Request, scope: string, identity = "") {
  return `${scope}:${clientAddress(request)}:${identity.trim().toLowerCase()}`;
}

export function checkRateLimit(key: string, options: { max: number; windowMs: number; blockMs: number }) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + options.windowMs, blockedUntil: 0 });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.blockedUntil > now) return { allowed: false, retryAfter: Math.ceil((current.blockedUntil - now) / 1000) };
  return { allowed: current.count < options.max, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

export function recordRateLimitFailure(key: string, options: { max: number; windowMs: number; blockMs: number }) {
  const now = Date.now();
  const current = attempts.get(key);
  const next = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + options.windowMs, blockedUntil: 0 }
    : { ...current, count: current.count + 1 };
  if (next.count >= options.max) next.blockedUntil = now + options.blockMs;
  attempts.set(key, next);
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
