import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() body: { id?: string; email: string; name: string }) {
    // Optionally accept id if the frontend generates it (like crypto.randomUUID), but Prisma uses cuid by default.
    // If we want to allow frontend to set ID, we need to update Prisma schema or handle it.
    // For now, we pass data to create
    return this.usersService.create(body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
