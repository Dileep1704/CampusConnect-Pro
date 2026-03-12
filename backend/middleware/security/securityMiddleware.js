const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

/**
 * Configure security middleware
 * @param {Object} app - Express app instance
 */
const securityMiddleware = (app) => {
  // ============================================
  // 1. Set security HTTP headers with Helmet
  // ============================================
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // ============================================
  // 2. Prevent XSS attacks
  // ============================================
  app.use(xss());

  // ============================================
  // 3. Prevent HTTP Parameter Pollution
  // ============================================
  app.use(hpp({
    whitelist: [
      'duration', 'type', 'location', 'skills', 
      'page', 'limit', 'sort', 'fields'
    ]
  }));

  // ============================================
  // 4. Sanitize data against NoSQL injection
  // ============================================
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  NoSQL injection attempt detected from IP: ${req.ip}, Key: ${key}`);
    }
  }));

  // ============================================
  // 5. Global rate limiting
  // ============================================
  const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/';
    }
  });
  
  app.use('/api', globalLimiter);

  // ============================================
  // 6. Auth-specific rate limiting (stricter)
  // ============================================
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
  });
  
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // ============================================
  // 7. CORS configuration (already in server.js)
  // ============================================
  // This is handled in server.js with cors middleware

  // ============================================
  // 8. Add security headers
  // ============================================
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  console.log('🔒 Security middleware configured');
};

module.exports = securityMiddleware;