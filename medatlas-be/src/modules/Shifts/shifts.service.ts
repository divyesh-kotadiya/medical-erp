// shift.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { Shift, ShiftDocument } from './schemas/shift.schema';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) { }

  create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = new this.shiftModel(createShiftDto);
    return shift.save();
  }

  async findAll(): Promise<Shift[]> {
    const shifts = await this.shiftModel.find().exec();

    const shiftsWithStaff = shifts.filter(s => s.staffId);

    if (shiftsWithStaff.length > 0) {
      await this.shiftModel.populate(shiftsWithStaff, {
        path: 'staffId',
        select: '-password -roleId -_id -tenantId -createdAt -updatedAt -__v',
      });
    }

    return shifts;
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftModel.findById(id).exec();

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    if (shift.staffId) {
      await shift.populate({
        path: 'staffId',
        select: '-password -roleId -_id -tenantId -createdAt -updatedAt -__v',
      });
    }

    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.shiftModel
      .findByIdAndUpdate(id, updateShiftDto, { new: true })
      .exec();
    if (!shift) throw new NotFoundException(`Shift with ID ${id} not found`);
    return shift;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.shiftModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return { message: `Shift with ID ${id} has been deleted successfully` };
  }

  async assignStaff(id: string, staffId: string): Promise<Shift> {
    const shift = await this.shiftModel
      .findByIdAndUpdate(id, { staffId }, { new: true })
      .exec();
    if (!shift) throw new NotFoundException(`Shift with ID ${id} not found`);
    return shift;
  }
}
