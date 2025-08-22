import { IsNumber, IsOptional } from 'class-validator';

export class GetInviteListDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
