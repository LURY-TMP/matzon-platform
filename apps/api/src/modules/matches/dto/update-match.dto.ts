import { IsOptional, IsInt, IsEnum, IsUUID, Min } from 'class-validator';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchDto {
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreOne?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreTwo?: number;

  @IsOptional()
  @IsUUID()
  winnerId?: string;
}
