import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, jwtConfig, redisConfig } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { MatchesModule } from './modules/matches/matches.module';
import { HealthModule } from './modules/health/health.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SocialModule } from './modules/social/social.module';
import { FeedModule } from './modules/feed/feed.module';
import { ReputationModule } from './modules/reputation/reputation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    MatchesModule,
    HealthModule,
    GatewayModule,
    NotificationsModule,
    SocialModule,
    FeedModule,
    ReputationModule,
  ],
})
export class AppModule {}
