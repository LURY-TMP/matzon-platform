import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        bio: true,
        level: true,
        xp: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        level: true,
        xp: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    await this.findById(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        level: true,
        xp: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${user.username}`);
    return user;
  }

  async getLeaderboard(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          level: true,
          xp: true,
          profile: {
            select: {
              wins: true,
              losses: true,
              matchesPlayed: true,
              rank: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
