import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/otp-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Response } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.loginOtp(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.usersService.register(registerDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.usersService.verifyOtp(dto, res);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body('userId') userId: string) {
    return this.usersService.resendOtp(userId);
  }

  // @Post('forgot-password')
  // @HttpCode(HttpStatus.OK)
  // async forgotPassword(@Body('email') email: string) {
  //   return this.usersService.generateResetToken(email);
  // }

  // @Put('forgot-password/:token')
  // @HttpCode(HttpStatus.OK)
  // async resetPassword(
  //   @Param('token') token: string,
  //   @Body() dto: ResetPasswordDto,
  // ) {
  //   return this.usersService.resetPasswordWithToken(token, dto.newPassword);
  // }

  // @UseGuards(JwtGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  // @UseGuards(JwtGuard)
  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<User | null> {
  //   return this.usersService.findById(id);
  // }

  // @UseGuards(JwtGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Delete(':id')
  // async remove(@Param('id') id: string): Promise<{ success: boolean }> {
  //   const success = await this.usersService.delete(id);
  //   return { success };
  // }

  // @UseGuards(JwtGuard)
  // @HttpCode(HttpStatus.OK)
  // @Post('change-password')
  // async changePassword(
  //   @Request() req: { user: { sub: string } },
  //   @Body() dto: ChangePasswordDto,
  // ) {
  //   return this.usersService.changePassword(
  //     req.user.sub,
  //     dto.currentPassword,
  //     dto.newPassword,
  //   );
  // }

  // @UseGuards(JwtGuard)
  // @Put(':id/profile')
  // @UseInterceptors(
  //   FileInterceptor('avatar', {
  //     ...new FileUploadService().getMulterOptions('avatars'),
  //   }),
  // )

  // @All('*')
  // @HttpCode(HttpStatus.NOT_FOUND)
  // handleNotFound() {
  //   throw new NotFoundException('Route not found in auth module');
  // }
}
