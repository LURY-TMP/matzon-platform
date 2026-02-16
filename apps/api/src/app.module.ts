import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, jwtConfig } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { MatchesModule } from './modules/matches/matches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    MatchesModule,
  ],
})
export class AppModule {}
