import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { EkspedisiService } from './ekspedisi.service';
import { CreateEkspedisiDto } from './dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from './dto/update-ekspedisi.dto';

@Controller('api/v1/ekspedisi')
export class EkspedisiController {
  constructor(private readonly ekspedisiService: EkspedisiService) {}

  @Post()
  async create(@Body() dto: CreateEkspedisiDto) {
    return this.ekspedisiService.create(dto);
  }

  @Get()
  async findAll() {
    return this.ekspedisiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ekspedisiService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEkspedisiDto) {
    return this.ekspedisiService.update(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateEkspedisiDto) {
    return this.ekspedisiService.updateStatus(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ekspedisiService.remove(id);
  }
}
