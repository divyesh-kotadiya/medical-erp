import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  All,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register-with-invite')
  @HttpCode(HttpStatus.CREATED)
  async registerWithInvite(
    @Body('token') token: string,
    @Body() dto: { name: string; password: string },
  ) {
    return this.usersService.registerWithInvite(token, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.usersService.generateResetToken(email);
  }

  @Put('forgot-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPasswordWithToken(token, dto.newPassword);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.usersService.delete(id);
    return { success };
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
  @Put(':id/profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      ...new FileUploadService().getMulterOptions('avatars'),
    }),
  )
  async updateProfile(
    @Param('id') userId: string,
    @Body()
    body: { name?: string; email?: string; phone?: string; avatar?: string },
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const updateData = { ...body };
    if (avatar) {
      updateData.avatar = `/uploads/avatars/${avatar.filename}`;
    }

    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateData,
    );
    return { message: 'Profile updated successfully', user: updatedUser };
  }

  @All('*')
  @HttpCode(HttpStatus.NOT_FOUND)
  handleNotFound() {
    throw new NotFoundException('Route not found in auth module');
  }
}
