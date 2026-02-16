import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TournamentStatus } from '@prisma/client';

export class UpdateTournamentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @IsOptional()
  @IsString()
  prizePool?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rules?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
