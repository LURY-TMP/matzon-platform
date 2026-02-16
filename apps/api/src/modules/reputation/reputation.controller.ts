import { Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReputationService } from './reputation.service';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputation: ReputationService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async myReputation(@Request() req: any) {
    return this.reputation.getUserReputation(req.user.id);
  }

  @Get('user/:id')
  async userReputation(@Param('id') userId: string) {
    return this.reputation.getUserReputation(userId);
  }

  @Get('me/follow-limit')
  @UseGuards(AuthGuard('jwt'))
  async followLimit(@Request() req: any) {
    return this.reputation.canFollow(req.user.id);
  }

  @Post('me/recalculate')
  @UseGuards(AuthGuard('jwt'))
  async recalculate(@Request() req: any) {
    return this.reputation.recalculateReputation(req.user.id);
  }
}
