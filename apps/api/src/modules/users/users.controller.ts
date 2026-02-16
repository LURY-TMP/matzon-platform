import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getLeaderboard(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
