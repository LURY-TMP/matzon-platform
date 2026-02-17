import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReputationService } from '../reputation/reputation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { AppGateway } from '../gateway/app.gateway';

const REPORT_LIMITS: Record<string, number> = {
  NEW: 3,
  BASIC: 5,
  TRUSTED: 10,
  VETERAN: 20,
  ELITE: 50,
};

interface CreateReportInput {
  reporterId: string;
  targetUserId?: string;
  targetType: string;
  targetId?: string;
  reason: string;
  description?: string;
}

interface ResolveReportInput {
  reportId: string;
  resolvedBy: string;
  status: 'CONFIRMED' | 'REJECTED';
  note?: string;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reputation: ReputationService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
    private readonly gateway: AppGateway,
  ) {}

  async createReport(input: CreateReportInput) {
    if (input.reporterId === input.targetUserId) {
      throw new BadRequestException('Cannot report yourself');
    }

    const reporter = await this.prisma.user.findUnique({
      where: { id: input.reporterId },
      select: { trustLevel: true, status: true },
    });

    if (!reporter || reporter.status === 'BANNED') {
      throw new ForbiddenException('Cannot file reports');
    }

    const dailyLimit = REPORT_LIMITS[reporter.trustLevel] || 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReports = await this.prisma.report.count({
      where: {
        reporterId: input.reporterId,
        createdAt: { gte: today },
      },
    });

    if (todayReports >= dailyLimit) {
      throw new ForbiddenException(`Daily report limit reached (${dailyLimit}). Higher trust levels allow more reports.`);
    }

    if (input.targetUserId) {
      const existing = await this.prisma.report.findFirst({
        where: {
          reporterId: input.reporterId,
          targetUserId: input.targetUserId,
          status: 'PENDING',
        },
      });

      if (existing) {
        throw new ConflictException('You already have a pending report against this user');
      }
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId: input.reporterId,
        targetUserId: input.targetUserId,
        targetType: input.targetType as any,
        targetId: input.targetId,
        reason: input.reason as any,
        description: input.description,
      },
    });

    await this.audit.log({
      actorId: input.reporterId,
      action: 'REPORT_CREATED',
      targetId: input.targetUserId || input.targetId,
      details: { reportId: report.id, reason: input.reason, targetType: input.targetType },
    });

    if (input.targetUserId) {
      await this.reputation.addEvent(input.targetUserId, 'REPORT_RECEIVED', input.reporterId, `Report: ${input.reason}`);
    }

    this.logger.log(`Report created: ${report.id} by ${input.reporterId} (${input.reason})`);
    return report;
  }

  async resolveReport(input: ResolveReportInput) {
    const report = await this.prisma.report.findUnique({
      where: { id: input.reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'PENDING' && report.status !== 'REVIEWING') {
      throw new BadRequestException('Report already resolved');
    }

    const updated = await this.prisma.report.update({
      where: { id: input.reportId },
      data: {
        status: input.status as any,
        resolvedBy: input.resolvedBy,
        resolvedNote: input.note,
        resolvedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: input.resolvedBy,
      action: 'REPORT_RESOLVED',
      targetId: report.targetUserId || report.targetId,
      details: { reportId: report.id, status: input.status, note: input.note },
    });

    if (input.status === 'CONFIRMED' && report.targetUserId) {
      await this.applyPenalty(report.targetUserId, input.resolvedBy, report.reason, report.id);
    }

    if (report.targetUserId) {
      await this.notifications.create({
        userId: report.reporterId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Report Update',
        message: input.status === 'CONFIRMED'
          ? 'Your report has been reviewed and action was taken. Thank you.'
          : 'Your report has been reviewed. No action was required at this time.',
        payload: { reportId: report.id, status: input.status },
      });
    }

    this.logger.log(`Report resolved: ${report.id} -> ${input.status} by ${input.resolvedBy}`);
    return updated;
  }

  async applyPenalty(userId: string, adminId: string, reason: string, reportId?: string) {
    await this.reputation.addEvent(userId, 'REPORT_VALIDATED', adminId, `Confirmed: ${reason}`, { reportId });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true, reportsReceived: true },
    });

    if (user && user.reportsReceived >= 5 && user.reputationScore < 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          restrictedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await this.audit.log({
        actorId: adminId,
        action: 'PENALTY_APPLIED',
        targetId: userId,
        details: { reason, duration: '7d', reportId },
      });

      await this.notifications.create({
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Account Restricted',
        message: 'Your account has been temporarily restricted due to repeated violations.',
        payload: { restrictedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      });

      this.gateway.emitToUser(userId, 'moderation:restricted', {
        reason,
        restrictedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    this.logger.log(`Penalty applied: ${userId} for ${reason}`);
  }

  async banUser(userId: string, adminId: string, reason: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'BANNED' },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'USER_BANNED',
      targetId: userId,
      details: { reason },
    });

    this.gateway.emitToUser(userId, 'moderation:banned', { reason });
    this.logger.log(`User banned: ${userId} by ${adminId}`);
  }

  async suspendUser(userId: string, adminId: string, reason: string, days: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        restrictedUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'USER_SUSPENDED',
      targetId: userId,
      details: { reason, days },
    });

    await this.notifications.create({
      userId,
      type: 'SYSTEM_ANNOUNCEMENT',
      title: 'Account Suspended',
      message: `Your account has been suspended for ${days} days: ${reason}`,
      payload: { days, reason },
    });

    this.gateway.emitToUser(userId, 'moderation:suspended', { reason, days });
    this.logger.log(`User suspended: ${userId} for ${days}d by ${adminId}`);
  }

  async reinstateUser(userId: string, adminId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE', restrictedUntil: null },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'USER_REINSTATED',
      targetId: userId,
    });

    this.logger.log(`User reinstated: ${userId} by ${adminId}`);
  }

  async getPendingReports(cursor?: string, limit = 20) {
    const reports = await this.prisma.report.findMany({
      where: { status: { in: ['PENDING', 'REVIEWING'] } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        reporter: { select: { id: true, username: true, trustLevel: true } },
        targetUser: { select: { id: true, username: true, reputationScore: true, reportsReceived: true, trustLevel: true } },
      },
    });

    const hasMore = reports.length > limit;
    const items = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async getReportStats() {
    const [pending, confirmed, rejected, total] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.report.count({ where: { status: 'REJECTED' } }),
      this.prisma.report.count(),
    ]);

    return { pending, confirmed, rejected, total };
  }
}
