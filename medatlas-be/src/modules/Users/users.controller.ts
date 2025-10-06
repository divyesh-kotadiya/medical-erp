// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Delete,
  Param,
  UseGuards,
  Request,
  Put,
  UseInterceptors,
  UploadedFile,
  Get,
  All,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/otp-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Response } from 'express';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('login')
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

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { sub: string } }) {
    return this.usersService.getUserById(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Put('profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      ...new FileUploadService().getMulterOptions('avatars'),
    }),
  )
  async updateProfile(
    @Request() req: { user: { sub: string } },
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatarFile: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(
      req.user.sub,
      updateProfileDto,
      avatarFile,
    );
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Request() req: { user: { sub: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.usersService.delete(id);
    return { success };
  }

  @All('*')
  @HttpCode(HttpStatus.NOT_FOUND)
  handleNotFound() {
    throw new NotFoundException('Route not found in auth module');
  }
}
