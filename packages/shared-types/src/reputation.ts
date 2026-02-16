export enum ReputationEventType {
  FOLLOW_RECEIVED = 'FOLLOW_RECEIVED',
  FOLLOW_GIVEN = 'FOLLOW_GIVEN',
  MATCH_WIN = 'MATCH_WIN',
  MATCH_LOSS = 'MATCH_LOSS',
  MATCH_PLAYED = 'MATCH_PLAYED',
  TOURNAMENT_JOIN = 'TOURNAMENT_JOIN',
  TOURNAMENT_TOP3 = 'TOURNAMENT_TOP3',
  TOURNAMENT_WIN = 'TOURNAMENT_WIN',
  REPORT_RECEIVED = 'REPORT_RECEIVED',
  REPORT_VALIDATED = 'REPORT_VALIDATED',
  SPAM_DETECTED = 'SPAM_DETECTED',
  ACCOUNT_AGE_BONUS = 'ACCOUNT_AGE_BONUS',
  STREAK_BONUS = 'STREAK_BONUS',
}

export enum TrustLevel {
  NEW = 'NEW',
  BASIC = 'BASIC',
  TRUSTED = 'TRUSTED',
  VETERAN = 'VETERAN',
  ELITE = 'ELITE',
}

export const REPUTATION_VALUES: Record<ReputationEventType, number> = {
  [ReputationEventType.FOLLOW_RECEIVED]: 2,
  [ReputationEventType.FOLLOW_GIVEN]: 0.5,
  [ReputationEventType.MATCH_WIN]: 5,
  [ReputationEventType.MATCH_LOSS]: 1,
  [ReputationEventType.MATCH_PLAYED]: 2,
  [ReputationEventType.TOURNAMENT_JOIN]: 3,
  [ReputationEventType.TOURNAMENT_TOP3]: 15,
  [ReputationEventType.TOURNAMENT_WIN]: 25,
  [ReputationEventType.REPORT_RECEIVED]: -5,
  [ReputationEventType.REPORT_VALIDATED]: -20,
  [ReputationEventType.SPAM_DETECTED]: -15,
  [ReputationEventType.ACCOUNT_AGE_BONUS]: 10,
  [ReputationEventType.STREAK_BONUS]: 8,
};

export const TRUST_THRESHOLDS: Record<TrustLevel, number> = {
  [TrustLevel.NEW]: 0,
  [TrustLevel.BASIC]: 25,
  [TrustLevel.TRUSTED]: 100,
  [TrustLevel.VETERAN]: 500,
  [TrustLevel.ELITE]: 2000,
};

export interface IReputationEvent {
  id: string;
  userId: string;
  actorId?: string;
  type: ReputationEventType;
  value: number;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IUserReputation {
  reputationScore: number;
  trustLevel: TrustLevel;
  reportsReceived: number;
  recentEvents: IReputationEvent[];
}
