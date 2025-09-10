import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function ensureValidObjectId(id: string) {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ObjectId: ${id}`);
  }
  return new Types.ObjectId(id);
}
