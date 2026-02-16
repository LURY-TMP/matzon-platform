import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface RateLimit {
  count: number;
  resetAt: number;
}

@Injectable()
export class WsThrottleGuard {
  private readonly logger = new Logger(WsThrottleGuard.name);
  private limits = new Map<string, RateLimit>();
  private readonly maxRequests = 30;
  private readonly windowMs = 10000;

  check(client: Socket): boolean {
    const key = client.id;
    const now = Date.now();
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    limit.count++;

    if (limit.count > this.maxRequests) {
      this.logger.warn(`WS rate limit exceeded: ${client.data?.user?.username || client.id}`);
      throw new WsException('Rate limit exceeded. Slow down.');
    }

    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, limit] of this.limits.entries()) {
      if (now > limit.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}
