import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ReportsController, AdminController } from './moderation.controller';
import { ReputationModule } from '../reputation/reputation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [ReputationModule, NotificationsModule, GatewayModule],
  controllers: [ReportsController, AdminController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
