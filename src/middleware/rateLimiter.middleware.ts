import type { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// ✅ General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? ''), // 👈 wrap properly
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
    });
  },
});
