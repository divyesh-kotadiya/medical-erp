import { Controller, Get, Post, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './schemas/roles.schema';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() body: Partial<Role>) {
    return this.rolesService.create(body);
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }
}
