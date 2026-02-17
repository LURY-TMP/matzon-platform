import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { ModerationService } from './moderation.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly moderation: ModerationService) {}

  @Post()
  async createReport(
    @Request() req: any,
    @Body() body: { targetUserId?: string; targetType: string; targetId?: string; reason: string; description?: string },
  ) {
    return this.moderation.createReport({
      reporterId: req.user.id,
      targetUserId: body.targetUserId,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      description: body.description,
    });
  }
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly moderation: ModerationService) {}

  @Get('reports')
  @Roles('ADMIN', 'MODERATOR')
  async pendingReports(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.moderation.getPendingReports(cursor, parseInt(limit || '20', 10));
  }

  @Get('reports/stats')
  @Roles('ADMIN', 'MODERATOR')
  async reportStats() {
    return this.moderation.getReportStats();
  }

  @Patch('reports/:id/resolve')
  @Roles('ADMIN', 'MODERATOR')
  async resolveReport(
    @Request() req: any,
    @Param('id') reportId: string,
    @Body() body: { status: 'CONFIRMED' | 'REJECTED'; note?: string },
  ) {
    return this.moderation.resolveReport({
      reportId,
      resolvedBy: req.user.id,
      status: body.status,
      note: body.note,
    });
  }

  @Post('users/:id/ban')
  @Roles('ADMIN')
  async banUser(@Request() req: any, @Param('id') userId: string, @Body() body: { reason: string }) {
    return this.moderation.banUser(userId, req.user.id, body.reason);
  }

  @Post('users/:id/suspend')
  @Roles('ADMIN', 'MODERATOR')
  async suspendUser(
    @Request() req: any,
    @Param('id') userId: string,
    @Body() body: { reason: string; days: number },
  ) {
    return this.moderation.suspendUser(userId, req.user.id, body.reason, body.days);
  }

  @Post('users/:id/reinstate')
  @Roles('ADMIN')
  async reinstateUser(@Request() req: any, @Param('id') userId: string) {
    return this.moderation.reinstateUser(userId, req.user.id);
  }
}
