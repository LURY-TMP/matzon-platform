import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';
import { WsThrottleGuard } from './ws-throttle.guard';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly wsThrottle: WsThrottleGuard,
    private readonly redis: RedisService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    this.cleanupInterval = setInterval(() => this.wsThrottle.cleanup(), 30000);
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.wsJwtGuard.validateSocket(client);
      client.data.user = user;

      await this.redis.trackSocketConnection(user.sub, client.id);
      await this.redis.setUserOnline(user.sub);

      client.join(`user:${user.sub}`);

      const onlineUsers = await this.redis.getOnlineUsers();

      client.emit('connected', {
        userId: user.sub,
        username: user.username,
        onlineCount: onlineUsers.length,
        timestamp: new Date().toISOString(),
      });

      this.server.emit('user:online', {
        userId: user.sub,
        username: user.username,
        onlineCount: onlineUsers.length,
      });

      this.logger.log(`Client connected: ${user.username} (${client.id})`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${err.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data?.user;
    if (!user) return;

    await this.redis.removeSocketConnection(user.sub, client.id);

    const isStillOnline = await this.redis.isUserOnline(user.sub);

    if (!isStillOnline) {
      const onlineUsers = await this.redis.getOnlineUsers();
      this.server.emit('user:offline', {
        userId: user.sub,
        username: user.username,
        onlineCount: onlineUsers.length,
      });
    }

    this.logger.log(`Client disconnected: ${user.username} (${client.id})`);
  }

  @SubscribeMessage('join:tournament')
  async handleJoinTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tournamentId: string },
  ) {
    this.wsThrottle.check(client);
    const user = client.data.user;
    if (!user || !data.tournamentId) return;

    const room = `tournament:${data.tournamentId}`;
    client.join(room);

    client.to(room).emit('tournament:user_joined', {
      userId: user.sub,
      username: user.username,
      tournamentId: data.tournamentId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`${user.username} joined room ${room}`);
  }

  @SubscribeMessage('leave:tournament')
  async handleLeaveTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tournamentId: string },
  ) {
    this.wsThrottle.check(client);
    const user = client.data.user;
    if (!user || !data.tournamentId) return;

    const room = `tournament:${data.tournamentId}`;
    client.leave(room);

    client.to(room).emit('tournament:user_left', {
      userId: user.sub,
      username: user.username,
      tournamentId: data.tournamentId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`${user.username} left room ${room}`);
  }

  @SubscribeMessage('join:match')
  async handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    this.wsThrottle.check(client);
    const user = client.data.user;
    if (!user || !data.matchId) return;

    const room = `match:${data.matchId}`;
    client.join(room);
    this.logger.log(`${user.username} joined room ${room}`);
  }

  @SubscribeMessage('leave:match')
  async handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    this.wsThrottle.check(client);
    const user = client.data.user;
    if (!user || !data.matchId) return;

    const room = `match:${data.matchId}`;
    client.leave(room);
    this.logger.log(`${user.username} left room ${room}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  emitToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToTournament(tournamentId: string, event: string, data: any): void {
    this.server.to(`tournament:${tournamentId}`).emit(event, data);
  }

  emitToMatch(matchId: string, event: string, data: any): void {
    this.server.to(`match:${matchId}`).emit(event, data);
  }

  emitGlobal(event: string, data: any): void {
    this.server.emit(event, data);
  }
}
