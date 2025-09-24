import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './shifts.service';
import { Shift } from './schemas/shift.schema';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { JwtGuard } from 'src/common/auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  async create(@Body() createShiftDto: CreateShiftDto): Promise<Shift> {
    return this.shiftService.create(createShiftDto);
  }

  @Post('by-tenant')
  async findAllByTenant(@Body('tenantId') tenantId: string): Promise<Shift[]> {
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
