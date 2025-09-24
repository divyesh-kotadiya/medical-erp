import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/Users/schemas/user.schema';

@Injectable()
export class HashService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly jwtService: JwtService) { }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(user: User): string {
    const payload = { sub: user._id.toString(), email: user.email };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }
}
