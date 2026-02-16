import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { WsJwtGuard } from './ws-jwt.guard';
import { WsThrottleGuard } from './ws-throttle.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'matzon-dev-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AppGateway, WsJwtGuard, WsThrottleGuard],
  exports: [AppGateway],
})
export class GatewayModule {}
