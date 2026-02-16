import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check() {
    return {
      status: 'ok',
      service: 'matzon-api',
      version: '0.1.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      this.logger.warn('PostgreSQL health check failed');
      dbStatus = 'error';
    }

    try {
      await this.redis.set('health:check', 'ok', 10);
      const val = await this.redis.get('health:check');
      redisStatus = val === 'ok' ? 'connected' : 'error';
    } catch {
      this.logger.warn('Redis health check failed');
      redisStatus = 'error';
    }

    const allHealthy = dbStatus === 'connected' && redisStatus === 'connected';

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      service: 'matzon-api',
      dependencies: {
        postgres: dbStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
