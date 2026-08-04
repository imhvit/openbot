import { config } from '@/config';
import chalk from 'chalk';
import { Redis } from 'ioredis';

const REDIS_URL = config.redisUrl;

export const redis = new Redis(REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log(chalk.red('[Redis]') + chalk.white(' Conexión establecida exitosamente.'));
});

redis.on('error', (error) => {
  console.error(chalk.red('[Redis]') + chalk.white(' Error de conexión:'), error.message);
});
