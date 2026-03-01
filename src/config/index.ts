import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  // Lazy-import to avoid circular dependency with logger
  const warn = (msg: string) => console.warn(`[config] ${msg}`);
  warn('STRIPE_WEBHOOK_SECRET is not set — Stripe webhook signature verification will be disabled');
}

// Validate AI_SERVICE_URL is a safe HTTP(S) URL (anti-SSRF)
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
if (process.env.AI_SERVICE_URL) {
  try {
    const parsed = new URL(aiServiceUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`AI_SERVICE_URL must use http or https protocol, got: ${parsed.protocol}`);
    }
    const privatePatterns = [
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
    ];
    if (privatePatterns.some((p) => p.test(parsed.hostname)) || parsed.hostname === 'localhost') {
      console.warn('[config] AI_SERVICE_URL points to a private/local address — ensure this is intentional');
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`AI_SERVICE_URL is not a valid URL: ${aiServiceUrl}`);
    }
    throw e;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  },
  aiService: {
    url: aiServiceUrl,
  },
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3001'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY || '',
    host: process.env.POSTHOG_HOST || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  stock: {
    lowThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10),
  },
  websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3001',
};
