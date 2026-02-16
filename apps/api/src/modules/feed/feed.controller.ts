import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async personalFeed(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feed.getPersonalFeed(req.user.id, cursor, parseInt(limit || '20', 10));
  }

  @Get('global')
  async globalFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feed.getGlobalFeed(cursor, parseInt(limit || '20', 10));
  }

  @Get('user/:userId')
  async userFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Request() req: any,
  ) {
    const userId = req.params.userId;
    return this.feed.getUserEvents(userId, cursor, parseInt(limit || '20', 10));
  }
}
