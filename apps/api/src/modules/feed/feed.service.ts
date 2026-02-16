import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';

interface CreateFeedEventInput {
  actorId: string;
  type: string;
  title: string;
  summary: string;
  payload?: Record<string, any>;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  async createEvent(input: CreateFeedEventInput) {
    const event = await this.prisma.feedEvent.create({
      data: {
        actorId: input.actorId,
        type: input.type as any,
        title: input.title,
        summary: input.summary,
        payload: input.payload || {},
      },
      include: {
        actor: {
          select: { id: true, username: true, avatarUrl: true, level: true },
        },
      },
    });

    const followers = await this.prisma.follow.findMany({
      where: { followingId: input.actorId },
      select: { followerId: true },
    });

    const eventPayload = {
      id: event.id,
      actorId: event.actorId,
      type: event.type,
      title: event.title,
      summary: event.summary,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
      actor: event.actor,
    };

    for (const follower of followers) {
      this.gateway.emitToUser(follower.followerId, 'feed:new_event', eventPayload);
    }

    this.logger.log(`Feed event: ${input.type} by ${input.actorId} -> ${followers.length} followers`);
    return event;
  }

  async getPersonalFeed(userId: string, cursor?: string, limit = 20) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId);

    const events = await this.prisma.feedEvent.findMany({
      where: { actorId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: {
          select: { id: true, username: true, avatarUrl: true, level: true },
        },
      },
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async getGlobalFeed(cursor?: string, limit = 20) {
    const events = await this.prisma.feedEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: {
          select: { id: true, username: true, avatarUrl: true, level: true },
        },
      },
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async getUserEvents(userId: string, cursor?: string, limit = 20) {
    const events = await this.prisma.feedEvent.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: {
          select: { id: true, username: true, avatarUrl: true, level: true },
        },
      },
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }
}
