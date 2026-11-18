// In-memory sliding window rate limiter for auth endpoints
const ipRequests = new Map();

/**
 * Creates an in-memory rate limiter middleware.
 * @param {number} maxRequests - Max requests allowed within windowMs
 * @param {number} windowMs - Time window in milliseconds
 */
export function authRateLimiter(maxRequests = 30, windowMs = 15 * 60 * 1000) {
  // Periodically clean up old IPs
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now - data.startTime > windowMs) {
        ipRequests.delete(ip);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    // Skip rate limiting in automated test environment
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipRequests.get(ip);
    if (!record || (now - record.startTime > windowMs)) {
      ipRequests.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (record.count >= maxRequests) {
      console.warn(`[Security] Rate limit exceeded for IP ${ip} on ${req.originalUrl}`);
      return res.status(429).json({
        message: 'Too many requests. Please try again after a few minutes.'
      });
    }

    record.count++;
    next();
  };
}
