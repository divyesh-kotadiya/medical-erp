import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './shifts.service';
import { Shift } from './schemas/shift.schema';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { JwtPayload } from '../Users/interface/jwt.interface';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) { }

  @Post()
  async create(@Body() createShiftDto: CreateShiftDto): Promise<Shift> {
    return this.shiftService.create(createShiftDto);
  }
  @Post('by-tenant')
  @UseGuards(JwtGuard)
  async findAllByTenant(@Req() req: Request): Promise<Shift[]> {
    const tenantId = (req.user as JwtPayload & { tenantId?: string }).tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID not found in token');
    }
    return this.shiftService.findAllByTenant(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Shift> {
    return this.shiftService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<Shift> {
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.shiftService.remove(id);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('staffId') staffId: string,
  ): Promise<Shift> {
    return this.shiftService.assignStaff(id, staffId);
  }
}
