import rateLimit from 'express-rate-limit';

// Standard 429 JSON response handler
const create429Handler = (customMessage) => (req, res /*, next, options */) => {
  return res.status(429).json({
    success: false,
    message: customMessage || 'Too many requests from this IP address. Please try again later.',
    retryAfterMinutes: 15,
  });
};

const isDevOrLocalhost = (req) => {
  if (process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true') return true;
  const ip = req.ip || req.connection?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('localhost');
};

/**
 * 1. Auth Rate Limiter (Login, Signup / Register)
 * Limit: 50 requests per 15 minutes in prod, skipped in dev/localhost
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevOrLocalhost,
  handler: create429Handler('Too many login or account registration attempts. Please wait 15 minutes before trying again.'),
});

/**
 * 2. Sensitive / OTP / Verification Limiter (Password reset, email verification, OTP dispatch)
 * Limit: 30 requests per 15 minutes in prod, skipped in dev/localhost
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevOrLocalhost,
  handler: create429Handler('Too many verification or OTP requests. Please wait 15 minutes before requesting another.'),
});

/**
 * 3. Paid Gateway & Heavy Operations Limiter (Checkout, Razorpay payment verification, PDF generation, File Uploads)
 * Limit: 100 requests per 15 minutes in prod, skipped in dev/localhost
 */
export const paidApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevOrLocalhost,
  handler: create429Handler('Too many checkout or payment processing requests. Please wait 15 minutes before trying again.'),
});

/**
 * 4. General Global API Rate Limiter
 * Limit: 1000 requests per 15 minutes in prod, skipped in dev/localhost
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevOrLocalhost,
  handler: create429Handler('Too many requests. API rate limit exceeded.'),
});
