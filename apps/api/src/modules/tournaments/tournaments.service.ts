import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateTournamentDto) {
    const tournament = await this.prisma.tournament.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        organizerId,
      },
      include: { organizer: { select: { id: true, username: true } } },
    });

    this.logger.log(`Tournament created: ${tournament.name} by ${organizerId}`);
    return tournament;
  }

  async findAll(filters: {
    game?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { game, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (game) where.game = game;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        include: {
          organizer: { select: { id: true, username: true } },
          _count: { select: { participants: true, matches: true } },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tournament.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, username: true, avatarUrl: true } },
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { seed: 'asc' },
        },
        _count: { select: { matches: true } },
      },
    });

    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(id: string, userId: string, dto: UpdateTournamentDto) {
    const tournament = await this.findById(id);

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can update this tournament');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    const tournament = await this.findById(id);

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can delete this tournament');
    }

    await this.prisma.tournament.delete({ where: { id } });
    this.logger.log(`Tournament deleted: ${id}`);
    return { success: true, message: 'Tournament deleted' };
  }

  async join(tournamentId: string, userId: string) {
    const tournament = await this.findById(tournamentId);

    if (tournament.status !== 'REGISTRATION') {
      throw new ConflictException('Tournament is not open for registration');
    }

    const participantCount = tournament.participants.length;
    if (participantCount >= tournament.maxPlayers) {
      throw new ConflictException('Tournament is full');
    }

    const existing = await this.prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });

    if (existing) throw new ConflictException('Already registered');

    const participant = await this.prisma.tournamentParticipant.create({
      data: { tournamentId, userId },
      include: { user: { select: { id: true, username: true } } },
    });

    this.logger.log(`User ${userId} joined tournament ${tournamentId}`);
    return participant;
  }

  async leave(tournamentId: string, userId: string) {
    const existing = await this.prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });

    if (!existing) throw new NotFoundException('Not registered in this tournament');

    await this.prisma.tournamentParticipant.delete({
      where: { id: existing.id },
    });

    this.logger.log(`User ${userId} left tournament ${tournamentId}`);
    return { success: true, message: 'Left tournament' };
  }
}
