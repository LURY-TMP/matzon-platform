import { authStorage } from './auth-storage';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: any = null;
let listeners = new Map<string, Set<Function>>();

export const socketClient = {
  async connect(): Promise<void> {
    if (socket?.connected) return;
    if (typeof window === 'undefined') return;

    const { io } = await import('socket.io-client');
    const token = authStorage.getAccessToken();
    if (!token) return;

    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[WS] Disconnected:', reason);
    });

    socket.on('error', (err: any) => {
      console.error('[WS] Error:', err.message);
      if (err.message === 'Authentication failed') {
        socket?.disconnect();
      }
    });

    socket.on('connect_error', (err: any) => {
      console.error('[WS] Connection error:', err.message);
    });

    for (const [event, fns] of listeners.entries()) {
      for (const fn of fns) {
        socket.on(event, fn);
      }
    }
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
  },

  on(event: string, callback: Function): void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(callback);
    socket?.on(event, callback);
  },

  off(event: string, callback: Function): void {
    listeners.get(event)?.delete(callback);
    socket?.off(event, callback);
  },

  emit(event: string, data?: any): void {
    socket?.emit(event, data);
  },

  joinTournament(tournamentId: string): void {
    socket?.emit('join:tournament', { tournamentId });
  },

  leaveTournament(tournamentId: string): void {
    socket?.emit('leave:tournament', { tournamentId });
  },

  joinMatch(matchId: string): void {
    socket?.emit('join:match', { matchId });
  },

  leaveMatch(matchId: string): void {
    socket?.emit('leave:match', { matchId });
  },

  isConnected(): boolean {
    return socket?.connected || false;
  },
};
