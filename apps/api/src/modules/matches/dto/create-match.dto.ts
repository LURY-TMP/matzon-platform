import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUUID,
} from 'class-validator';

export class CreateMatchDto {
  @IsOptional()
  @IsUUID()
  tournamentId?: string;

  @IsString()
  @IsNotEmpty()
  game: string;

  @IsOptional()
  @IsInt()
  round?: number;

  @IsUUID()
  @IsNotEmpty()
  playerOneId: string;

  @IsUUID()
  @IsNotEmpty()
  playerTwoId: string;
}
