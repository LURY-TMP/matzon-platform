import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatchDto, UpdateMatchDto } from './dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMatchDto) {
    if (dto.playerOneId === dto.playerTwoId) {
      throw new BadRequestException('A player cannot match against themselves');
    }

    const match = await this.prisma.match.create({
      data: dto,
      include: {
        playerOne: { select: { id: true, username: true, avatarUrl: true } },
        playerTwo: { select: { id: true, username: true, avatarUrl: true } },
        tournament: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Match created: ${match.id}`);
    return match;
  }

  async findAll(filters: {
    tournamentId?: string;
    status?: string;
    game?: string;
    page?: number;
    limit?: number;
  }) {
    const { tournamentId, status, game, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (status) where.status = status;
    if (game) where.game = game;

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        include: {
          playerOne: { select: { id: true, username: true, avatarUrl: true } },
          playerTwo: { select: { id: true, username: true, avatarUrl: true } },
          winner: { select: { id: true, username: true } },
          tournament: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.match.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        playerOne: { select: { id: true, username: true, avatarUrl: true, level: true } },
        playerTwo: { select: { id: true, username: true, avatarUrl: true, level: true } },
        winner: { select: { id: true, username: true } },
        tournament: { select: { id: true, name: true, game: true } },
      },
    });

    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async update(id: string, dto: UpdateMatchDto) {
    await this.findById(id);

    const data: any = { ...dto };

    if (dto.status === 'LIVE' && !dto.winnerId) {
      data.startedAt = new Date();
    }

    if (dto.status === 'COMPLETED' && dto.winnerId) {
      data.completedAt = new Date();
      await this.updatePlayerStats(id, dto.winnerId);
    }

    const match = await this.prisma.match.update({
      where: { id },
      data,
      include: {
        playerOne: { select: { id: true, username: true } },
        playerTwo: { select: { id: true, username: true } },
        winner: { select: { id: true, username: true } },
      },
    });

    this.logger.log(`Match updated: ${id} — status: ${match.status}`);
    return match;
  }

  private async updatePlayerStats(matchId: string, winnerId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return;

    const loserId =
      match.playerOneId === winnerId
        ? match.playerTwoId
        : match.playerOneId;

    await this.prisma.$transaction([
      this.prisma.profile.updateMany({
        where: { userId: winnerId },
        data: {
          wins: { increment: 1 },
          matchesPlayed: { increment: 1 },
        },
      }),
      this.prisma.profile.updateMany({
        where: { userId: loserId },
        data: {
          losses: { increment: 1 },
          matchesPlayed: { increment: 1 },
        },
      }),
      this.prisma.user.update({
        where: { id: winnerId },
        data: { xp: { increment: 25 } },
      }),
      this.prisma.user.update({
        where: { id: loserId },
        data: { xp: { increment: 5 } },
      }),
    ]);

    this.logger.log(`Stats updated: winner=${winnerId}, loser=${loserId}`);
  }
}
