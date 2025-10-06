/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { GetInviteListDto } from './dto/get-invites.dto';
import { JwtPayload } from '../Users/interface/jwt.interface';
import { UserInviteListDto } from './dto/user-invite.dto';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createInvite(
    @Body() createInviteDto: CreateInviteDto,
    @Request() req: any,
  ) {
    const adminUserId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { tenantId?: string }).tenantId;
    if (!adminUserId) {
      throw new BadRequestException('Not authenticated');
    }

    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in token');
    }

    return this.invitesService.createInvite(
      createInviteDto,
      adminUserId,
      tenantId,
    );
  }

  @UseGuards(JwtGuard)
  @Post('tenant/list')
  async getInvitesByTenant(
    @Request() req: any,
    @Body() getInviteListDto: GetInviteListDto,
  ) {
    const adminUserId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { tenantId?: string }).tenantId;

    if (!adminUserId) {
      throw new BadRequestException('Not authenticated');
    }

    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in token');
    }

    return this.invitesService.getInvitesByTenant(
      tenantId,
      getInviteListDto,
      adminUserId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getMyInvites(
    @Request() req: any,
    @Body() getUserInviteListDto: UserInviteListDto,
  ) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    if (!userId) throw new BadRequestException('Not authenticated');

    return this.invitesService.getInvitesForUser(userId, getUserInviteListDto);
  }

  @UseGuards(JwtGuard)
  @Post('accept')
  async acceptInvite(@Body('token') token: string, @Request() req: any) {
    if (!token) throw new BadRequestException('token is required');
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;

    if (!userId) throw new BadRequestException('Not authenticated');

    return this.invitesService.acceptInvite(token, userId);
  }

  @UseGuards(JwtGuard)
  @Post('reject')
  async rejectInvite(@Body('token') token: string, @Request() req: any) {
    if (!token) throw new BadRequestException('token is required');
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    if (!userId) throw new BadRequestException('Not authenticated');

    await this.invitesService.rejectInvite(token, userId);
    return { message: 'Invite rejected' };
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteInvite(@Param('id') id: string, @Request() req: any) {
    const adminUserId = (req.user as JwtPayload & { sub?: string })?.sub;
    if (!adminUserId) throw new BadRequestException('Not authenticated');

    const success = await this.invitesService.deleteInvite(id, adminUserId);
    return { success };
  }
}
