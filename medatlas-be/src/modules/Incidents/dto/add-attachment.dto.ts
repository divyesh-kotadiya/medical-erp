import { IsNotEmpty, IsString } from 'class-validator';

export class AddAttachmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
