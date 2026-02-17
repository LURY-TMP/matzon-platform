export enum ReportTargetType {
  USER = 'USER',
  MATCH = 'MATCH',
  TOURNAMENT = 'TOURNAMENT',
  COMMENT = 'COMMENT',
}

export enum ReportReason {
  SPAM = 'SPAM',
  ABUSE = 'ABUSE',
  CHEATING = 'CHEATING',
  IMPERSONATION = 'IMPERSONATION',
  HARASSMENT = 'HARASSMENT',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum AuditAction {
  REPORT_CREATED = 'REPORT_CREATED',
  REPORT_RESOLVED = 'REPORT_RESOLVED',
  PENALTY_APPLIED = 'PENALTY_APPLIED',
  TRUST_OVERRIDE = 'TRUST_OVERRIDE',
  REPUTATION_RECALC = 'REPUTATION_RECALC',
  USER_BANNED = 'USER_BANNED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_REINSTATED = 'USER_REINSTATED',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

export const REPORT_LIMITS: Record<string, number> = {
  NEW: 3,
  BASIC: 5,
  TRUSTED: 10,
  VETERAN: 20,
  ELITE: 50,
};

export interface IReport {
  id: string;
  reporterId: string;
  targetUserId?: string;
  targetType: ReportTargetType;
  targetId?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedNote?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface IAuditLog {
  id: string;
  actorId: string;
  action: AuditAction;
  targetId?: string;
  details?: Record<string, any>;
  createdAt: Date;
}
