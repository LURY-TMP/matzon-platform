import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateAuditInput {
  actorId: string;
  action: string;
  targetId?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditInput) {
    const entry = await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action as any,
        targetId: input.targetId,
        details: input.details || {},
      },
    });

    this.logger.log(`Audit: ${input.action} by ${input.actorId}${input.targetId ? ` -> ${input.targetId}` : ''}`);
    return entry;
  }

  async findByActor(actorId: string, cursor?: string, limit = 20) {
    const logs = await this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: { select: { id: true, username: true, role: true } },
      },
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async findByTarget(targetId: string, cursor?: string, limit = 20) {
    const logs = await this.prisma.auditLog.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: { select: { id: true, username: true, role: true } },
      },
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async findByAction(action: string, cursor?: string, limit = 20) {
    const logs = await this.prisma.auditLog.findMany({
      where: { action: action as any },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: { select: { id: true, username: true, role: true } },
      },
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasMore };
  }

  async getRecent(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, username: true, role: true } },
      },
    });
  }
}
