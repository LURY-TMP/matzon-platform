import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('redis.url') || 'redis://localhost:6379';

    this.client = new Redis(url, {
      retryStrategy: (times) => {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
      maxRetriesPerRequest: 3,
    });

    this.subscriber = new Redis(url, {
      retryStrategy: (times) => {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.client.on('error', (err) => this.logger.error(`Redis client error: ${err.message}`));
    this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
    this.subscriber.on('error', (err) => this.logger.error(`Redis subscriber error: ${err.message}`));
  }

  async onModuleDestroy() {
    await this.client?.quit();
    await this.subscriber?.quit();
    this.logger.log('Redis connections closed');
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async setUserOnline(userId: string): Promise<void> {
    await this.client.sadd('users:online', userId);
    await this.client.setex(`user:last_seen:${userId}`, 3600, Date.now().toString());
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.client.srem('users:online', userId);
    await this.client.set(`user:last_seen:${userId}`, Date.now().toString());
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.client.smembers('users:online');
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return (await this.client.sismember('users:online', userId)) === 1;
  }

  async trackSocketConnection(userId: string, socketId: string): Promise<void> {
    await this.client.hset('socket:connections', socketId, userId);
    await this.client.sadd(`user:sockets:${userId}`, socketId);
  }

  async removeSocketConnection(userId: string, socketId: string): Promise<void> {
    await this.client.hdel('socket:connections', socketId);
    await this.client.srem(`user:sockets:${userId}`, socketId);
    const remaining = await this.client.scard(`user:sockets:${userId}`);
    if (remaining === 0) {
      await this.setUserOffline(userId);
    }
  }

  async getUserSockets(userId: string): Promise<string[]> {
    return this.client.smembers(`user:sockets:${userId}`);
  }
}
