import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchesService } from './matches.service';
import { CreateMatchDto, UpdateMatchDto } from './dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tournamentId') tournamentId?: string,
    @Query('status') status?: string,
    @Query('game') game?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchesService.findAll({
      tournamentId,
      status,
      game,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, dto);
  }
}
