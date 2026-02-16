import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTournamentDto,
  ) {
    return this.tournamentsService.create(userId, dto);
  }

  @Get()
  async findAll(
    @Query('game') game?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tournamentsService.findAll({
      game,
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tournamentsService.delete(id, userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  async join(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tournamentsService.join(id, userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  async leave(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tournamentsService.leave(id, userId);
  }
}
