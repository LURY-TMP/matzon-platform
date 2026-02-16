import { Controller, Post, Delete, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialService } from './social.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Post(':id/follow')
  async follow(@Request() req: any, @Param('id') targetId: string) {
    return this.social.follow(req.user.id, targetId);
  }

  @Delete(':id/follow')
  async unfollow(@Request() req: any, @Param('id') targetId: string) {
    return this.social.unfollow(req.user.id, targetId);
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.social.getFollowers(userId, cursor, parseInt(limit || '20', 10));
  }

  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.social.getFollowing(userId, cursor, parseInt(limit || '20', 10));
  }

  @Get(':id/relationship')
  async getRelationship(@Request() req: any, @Param('id') targetId: string) {
    return this.social.getRelationship(req.user.id, targetId);
  }
}
