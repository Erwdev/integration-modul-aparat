import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ekspedisi } from './entities/ekspedisi.entity';
import { CreateEkspedisiDto } from './dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from './dto/update-ekspedisi.dto';

@Injectable()
export class EkspedisiService {
  constructor(
    @InjectRepository(Ekspedisi)
    private readonly ekspedisiRepository: Repository<Ekspedisi>,
  ) {}

  async create(dto: CreateEkspedisiDto): Promise<Ekspedisi> {
    const ekspedisi = this.ekspedisiRepository.create(dto);
    return this.ekspedisiRepository.save(ekspedisi);
  }

  async findAll(): Promise<Ekspedisi[]> {
    return this.ekspedisiRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ekspedisi> {
    const ekspedisi = await this.ekspedisiRepository.findOne({ where: { id } });
    if (!ekspedisi) {
      throw new NotFoundException(`Ekspedisi dengan ID ${id} tidak ditemukan`);
    }
    return ekspedisi;
  }

  async update(id: string, dto: UpdateEkspedisiDto): Promise<Ekspedisi> {
    const ekspedisi = await this.findOne(id);
    Object.assign(ekspedisi, dto);
    return this.ekspedisiRepository.save(ekspedisi);
  }

  async updateStatus(id: string, dto: UpdateEkspedisiDto): Promise<Ekspedisi> {
  const ekspedisi = await this.findOne(id);
  // hanya update jika status dikirim
  if (dto.status !== undefined) {
    ekspedisi.status = dto.status;
    }
  return this.ekspedisiRepository.save(ekspedisi);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const ekspedisi = await this.findOne(id);
    await this.ekspedisiRepository.remove(ekspedisi);
    return { deleted: true };
  }
}
