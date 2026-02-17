import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { AuditService } from './audit.service';

@Controller('admin/audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  async recent(@Query('limit') limit?: string) {
    return this.audit.getRecent(parseInt(limit || '50', 10));
  }

  @Get('actor/:id')
  async byActor(@Param('id') actorId: string, @Query('cursor') cursor?: string) {
    return this.audit.findByActor(actorId, cursor);
  }

  @Get('target/:id')
  async byTarget(@Param('id') targetId: string, @Query('cursor') cursor?: string) {
    return this.audit.findByTarget(targetId, cursor);
  }

  @Get('action/:action')
  async byAction(@Param('action') action: string, @Query('cursor') cursor?: string) {
    return this.audit.findByAction(action, cursor);
  }
}
