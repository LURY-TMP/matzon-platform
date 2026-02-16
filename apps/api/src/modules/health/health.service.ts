import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

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

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      this.logger.warn('Database health check failed');
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'ready' : 'not_ready',
      service: 'matzon-api',
      dependencies: {
        postgres: dbStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
