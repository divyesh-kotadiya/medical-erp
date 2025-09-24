import { IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}
