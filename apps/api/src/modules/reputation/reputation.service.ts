import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';

const REPUTATION_VALUES: Record<string, number> = {
  FOLLOW_RECEIVED: 2,
  FOLLOW_GIVEN: 0.5,
  MATCH_WIN: 5,
  MATCH_LOSS: 1,
  MATCH_PLAYED: 2,
  TOURNAMENT_JOIN: 3,
  TOURNAMENT_TOP3: 15,
  TOURNAMENT_WIN: 25,
  REPORT_RECEIVED: -5,
  REPORT_VALIDATED: -20,
  SPAM_DETECTED: -15,
  ACCOUNT_AGE_BONUS: 10,
  STREAK_BONUS: 8,
};

const TRUST_THRESHOLDS = [
  { level: 'ELITE', min: 2000 },
  { level: 'VETERAN', min: 500 },
  { level: 'TRUSTED', min: 100 },
  { level: 'BASIC', min: 25 },
  { level: 'NEW', min: 0 },
];

const FOLLOW_LIMITS: Record<string, number> = {
  NEW: 20,
  BASIC: 50,
  TRUSTED: 200,
  VETERAN: 500,
  ELITE: 2000,
};

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  async addEvent(userId: string, type: string, actorId?: string, reason?: string, metadata?: Record<string, any>) {
    const value = REPUTATION_VALUES[type] || 0;
    if (value === 0) return null;

    const result = await this.prisma.$transaction(async (tx) => {
      const event = await tx.reputationEvent.create({
        data: {
          userId,
          actorId,
          type: type as any,
          value,
          reason,
          metadata: metadata || {},
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          reputationScore: { increment: value },
          ...(type === 'REPORT_RECEIVED' ? { reportsReceived: { increment: 1 } } : {}),
        },
        select: { reputationScore: true, trustLevel: true, reportsReceived: true },
      });

      const newTrustLevel = this.calculateTrustLevel(user.reputationScore);

      if (newTrustLevel !== user.trustLevel) {
        await tx.user.update({
          where: { id: userId },
          data: { trustLevel: newTrustLevel as any },
        });

        this.gateway.emitToUser(userId, 'reputation:trust_changed', {
          oldLevel: user.trustLevel,
          newLevel: newTrustLevel,
          reputationScore: user.reputationScore,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`Trust level changed: ${userId} ${user.trustLevel} -> ${newTrustLevel}`);
      }

      return { event, reputationScore: user.reputationScore, trustLevel: newTrustLevel };
    });

    this.gateway.emitToUser(userId, 'reputation:updated', {
      type,
      value,
      newScore: result.reputationScore,
      trustLevel: result.trustLevel,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Reputation: ${type} (${value > 0 ? '+' : ''}${value}) -> ${userId} (total: ${result.reputationScore})`);
    return result;
  }

  calculateTrustLevel(score: number): string {
    for (const threshold of TRUST_THRESHOLDS) {
      if (score >= threshold.min) return threshold.level;
    }
    return 'NEW';
  }

  async getUserReputation(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true, trustLevel: true, reportsReceived: true },
    });

    if (!user) return null;

    const recentEvents = await this.prisma.reputationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const eventsByType = await this.prisma.reputationEvent.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { value: true },
      _count: { id: true },
    });

    return {
      reputationScore: user.reputationScore,
      trustLevel: user.trustLevel,
      reportsReceived: user.reportsReceived,
      recentEvents,
      breakdown: eventsByType.map((e) => ({
        type: e.type,
        totalValue: e._sum.value || 0,
        count: e._count.id,
      })),
    };
  }

  async getFollowLimit(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustLevel: true },
    });
    return FOLLOW_LIMITS[user?.trustLevel || 'NEW'] || 20;
  }

  async canFollow(userId: string): Promise<{ allowed: boolean; limit: number; current: number }> {
    const [limit, profile] = await Promise.all([
      this.getFollowLimit(userId),
      this.prisma.profile.findUnique({
        where: { userId },
        select: { following: true },
      }),
    ]);

    const current = profile?.following || 0;
    return { allowed: current < limit, limit, current };
  }

  async recalculateReputation(userId: string) {
    const events = await this.prisma.reputationEvent.findMany({
      where: { userId },
      select: { value: true },
    });

    const totalScore = events.reduce((sum, e) => sum + e.value, 0);
    const newTrustLevel = this.calculateTrustLevel(totalScore);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        reputationScore: totalScore,
        trustLevel: newTrustLevel as any,
      },
    });

    this.logger.log(`Reputation recalculated: ${userId} -> ${totalScore} (${newTrustLevel})`);
    return { reputationScore: totalScore, trustLevel: newTrustLevel };
  }
}
