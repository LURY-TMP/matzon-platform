import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@Request() req: any, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.notifications.findByUser(req.user.id, cursor, parseInt(limit || '20', 10));
  }

  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    const count = await this.notifications.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Request() req: any, @Param('id') id: string) {
    await this.notifications.markAsRead(req.user.id, id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    await this.notifications.markAllAsRead(req.user.id);
    return { success: true };
  }
}
