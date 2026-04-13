import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KeysService } from './keys.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Post()
  create(@Body() createKeyDto: { name: string }) {
    // For now, hardcode to mock-user-1 to match system context
    return this.keysService.create('mock-user-1', createKeyDto.name);
  }

  @Get()
  findAll() {
    return this.keysService.findAll('mock-user-1');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keysService.remove(id);
  }
}
