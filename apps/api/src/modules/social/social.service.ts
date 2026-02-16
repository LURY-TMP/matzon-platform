import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppGateway } from '../gateway/app.gateway';
import { FeedService } from '../feed/feed.service';
import { ReputationService } from '../reputation/reputation.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly gateway: AppGateway,
    private readonly feed: FeedService,
    private readonly reputation: ReputationService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const canFollow = await this.reputation.canFollow(followerId);
    if (!canFollow.allowed) {
      throw new ForbiddenException(`Follow limit reached (${canFollow.current}/${canFollow.limit}). Increase your trust level to follow more.`);
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, username: true, status: true },
    });

    if (!targetUser || targetUser.status === 'BANNED') {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const follow = await tx.follow.create({
        data: { followerId, followingId },
      });

      await tx.profile.update({
        where: { userId: followerId },
        data: { following: { increment: 1 } },
      });

      await tx.profile.update({
        where: { userId: followingId },
        data: { followers: { increment: 1 } },
      });

      return follow;
    });

    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true, avatarUrl: true },
    });

    await this.notifications.create({
      userId: followingId,
      type: 'FOLLOW_NEW',
      title: 'New Follower',
      message: `${follower?.username} started following you`,
      actorId: followerId,
      payload: { followerId, followerUsername: follower?.username },
    });

    await this.feed.createEvent({
      actorId: followerId,
      type: 'USER_FOLLOWED',
      title: 'Started following',
      summary: `${follower?.username} started following ${targetUser.username}`,
      payload: { followingId, followingUsername: targetUser.username },
    });

    await this.reputation.addEvent(followingId, 'FOLLOW_RECEIVED', followerId);
    await this.reputation.addEvent(followerId, 'FOLLOW_GIVEN', followingId);

    this.gateway.emitToUser(followingId, 'social:followed', {
      followerId,
      followerUsername: follower?.username,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`${followerId} followed ${followingId}`);
    return result;
  }

  async unfollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (!existing) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });

      await tx.profile.update({
        where: { userId: followerId },
        data: { following: { decrement: 1 } },
      });

      await tx.profile.update({
        where: { userId: followingId },
        data: { followers: { decrement: 1 } },
      });
    });

    this.gateway.emitToUser(followingId, 'social:unfollowed', {
      followerId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`${followerId} unfollowed ${followingId}`);
    return { success: true };
  }

  async getFollowers(userId: string, cursor?: string, limit = 20) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        follower: {
          select: { id: true, username: true, avatarUrl: true, level: true, xp: true, trustLevel: true },
        },
      },
    });

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      data: items.map((f) => ({ id: f.id, user: f.follower, followedAt: f.createdAt })),
      nextCursor,
      hasMore,
    };
  }

  async getFollowing(userId: string, cursor?: string, limit = 20) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        following: {
          select: { id: true, username: true, avatarUrl: true, level: true, xp: true, trustLevel: true },
        },
      },
    });

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      data: items.map((f) => ({ id: f.id, user: f.following, followedAt: f.createdAt })),
      nextCursor,
      hasMore,
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getRelationship(currentUserId: string, targetUserId: string) {
    const [isFollowing, isFollowedBy] = await Promise.all([
      this.isFollowing(currentUserId, targetUserId),
      this.isFollowing(targetUserId, currentUserId),
    ]);
    return { isFollowing, isFollowedBy, isMutual: isFollowing && isFollowedBy };
  }
}
