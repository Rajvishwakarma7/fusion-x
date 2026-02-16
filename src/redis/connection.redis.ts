import Redis from "ioredis";
import { logger } from "../logger";


const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  logger.error('REDIS_URL is not defined');
  throw new Error('Missing REDIS_URL');
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 5,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  logger.info('🔌 Redis connected');
});

redis.on('error', (err) => {
  logger.error(`❌ Redis error: ${err.message}`);
});

redis.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});