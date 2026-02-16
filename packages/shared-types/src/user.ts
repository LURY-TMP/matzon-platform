export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  ORGANIZER = 'ORGANIZER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile extends IUser {
  followers: number;
  following: number;
  matchesPlayed: number;
  winRate: number;
  rank: number;
}
