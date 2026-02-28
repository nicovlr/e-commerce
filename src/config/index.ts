import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },
};
