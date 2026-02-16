export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IMatch {
  id: string;
  tournamentId?: string;
  game: string;
  status: MatchStatus;
  playerOneId: string;
  playerTwoId: string;
  scoreOne?: number;
  scoreTwo?: number;
  winnerId?: string;
  startedAt?: Date;
  completedAt?: Date;
}
