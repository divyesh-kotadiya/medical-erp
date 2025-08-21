import { Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
