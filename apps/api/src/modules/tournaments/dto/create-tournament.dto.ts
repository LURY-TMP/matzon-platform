import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { TournamentFormat } from '@prisma/client';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  game: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TournamentFormat)
  format?: TournamentFormat;

  @IsInt()
  @Min(2)
  @Max(256)
  maxPlayers: number;

  @IsOptional()
  @IsString()
  prizePool?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rules?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
