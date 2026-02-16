export enum WsEvent {
  CONNECTED = 'connected',
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',

  JOIN_TOURNAMENT = 'join:tournament',
  LEAVE_TOURNAMENT = 'leave:tournament',
  TOURNAMENT_USER_JOINED = 'tournament:user_joined',
  TOURNAMENT_USER_LEFT = 'tournament:user_left',
  TOURNAMENT_UPDATED = 'tournament:updated',
  TOURNAMENT_STARTED = 'tournament:started',

  JOIN_MATCH = 'join:match',
  LEAVE_MATCH = 'leave:match',
  MATCH_SCORE_UPDATE = 'match:score_update',
  MATCH_COMPLETED = 'match:completed',
  MATCH_STARTED = 'match:started',

  NOTIFICATION = 'notification',
  FEED_NEW_EVENT = 'feed:new_event',
  PING = 'ping',
  PONG = 'pong',
}

export enum NotificationType {
  TOURNAMENT_JOINED = 'TOURNAMENT_JOINED',
  TOURNAMENT_STARTED = 'TOURNAMENT_STARTED',
  TOURNAMENT_COMPLETED = 'TOURNAMENT_COMPLETED',
  MATCH_SCHEDULED = 'MATCH_SCHEDULED',
  MATCH_STARTED = 'MATCH_STARTED',
  MATCH_COMPLETED = 'MATCH_COMPLETED',
  RANK_CHANGED = 'RANK_CHANGED',
  FOLLOW_NEW = 'FOLLOW_NEW',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export enum FeedEventType {
  USER_FOLLOWED = 'USER_FOLLOWED',
  TOURNAMENT_CREATED = 'TOURNAMENT_CREATED',
  TOURNAMENT_JOINED = 'TOURNAMENT_JOINED',
  TOURNAMENT_WON = 'TOURNAMENT_WON',
  MATCH_COMPLETED = 'MATCH_COMPLETED',
  MATCH_WON = 'MATCH_WON',
  LEVEL_UP = 'LEVEL_UP',
  RANK_CHANGED = 'RANK_CHANGED',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export interface IWsPayload<T = any> {
  event: WsEvent;
  data: T;
  timestamp: string;
}

export interface INotification {
  id: string;
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface IFeedEvent {
  id: string;
  actorId: string;
  type: FeedEventType;
  title: string;
  summary: string;
  payload?: Record<string, any>;
  createdAt: Date;
  actor?: {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
  };
}
