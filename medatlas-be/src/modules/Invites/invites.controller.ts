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
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtGuard } from 'src/common/auth/jwt.guard';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}
  @Get(':token')
  async getInviteByToken(@Param('token') token: string) {
    const invite = await this.invitesService.findByToken(token);
    return {
      email: invite.email,
      tenantId: invite.tenantId,
      expiresAt: invite.expiresAt,
    };
  }

  @UseGuards(JwtGuard)
  @Post()
  async createInvite(
    @Body() createInviteDto: CreateInviteDto,
    @Request() req: any,
  ) {
    if (!req.user.isTenantAdmin) {
      throw new Error('Only tenant admins can create invites');
    }
    return this.invitesService.createInvite(
      createInviteDto,
      req.user.tenantId,
      req.user.sub,
    );
  }

  @UseGuards(JwtGuard)
  @Get()
  async getInvitesByTenant(@Request() req: any) {
    if (!req.user.isTenantAdmin) {
      throw new Error('Only tenant admins can view invites');
    }

    return this.invitesService.getInvitesByTenant(req.user.tenantId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteInvite(@Param('id') id: string, @Request() req: any) {
    if (!req.user.isTenantAdmin) {
      throw new Error('Only tenant admins can delete invites');
    }

    const success = await this.invitesService.deleteInvite(id);
    return { success };
  }
}
