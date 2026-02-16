import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    try {
      const user = client.data?.user;
      if (!user) throw new WsException('Not authenticated');
      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

  async validateSocket(client: Socket): Promise<any> {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this.jwt.verify(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status === 'BANNED') {
        throw new WsException('Access denied');
      }

      return {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (err) {
      this.logger.warn(`WS auth failed: ${err.message}`);
      throw new WsException('Invalid token');
    }
  }
}
