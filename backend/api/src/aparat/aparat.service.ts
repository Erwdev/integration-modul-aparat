import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aparat } from './entities/aparat.entity';
import { Repository, Like, In } from 'typeorm';
import { CreateAparatDto } from './dto/create-aparat.dto';
import { UpdateAparatDto } from './dto/update-aparat.dto';
import { FilterAparatDto } from './dto/filter-aparat.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AparatService {
  constructor(
    @InjectRepository(Aparat)
    private readonly repo: Repository<Aparat>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async ensureUniqueNikNip(nik?: string, nip?: string, excludeId?: string) {
  if (nik) {
    const q = this.repo.createQueryBuilder('a').where('a.nik = :nik', { nik });
    if (excludeId) q.andWhere('a.id_aparat != :id', { id: excludeId });
    const ex = await q.getOne();
    if (ex) throw new ConflictException('NIK already exists');
  }
  if (nip) {
    const q2 = this.repo.createQueryBuilder('a').where('a.nip = :nip', { nip });
    if (excludeId) q2.andWhere('a.id_aparat != :id', { id: excludeId });
    const ex2 = await q2.getOne();
    if (ex2) throw new ConflictException('NIP already exists');
  }
}


  async create(dto: CreateAparatDto): Promise<Aparat> {
    await this.ensureUniqueNikNip(dto.nik, dto.nip);
    const maxUrut = await this.repo
      .createQueryBuilder('a')
      .select('MAX(a.nomor_urut)', 'max')
      .getRawOne();
    const next = (maxUrut?.max ?? 0) + 1;
    const aparat = this.repo.create({ ...dto, nomor_urut: next });
    return this.repo.save(aparat);
  }

  async findAll(filter?: FilterAparatDto) {
    const qb = this.repo.createQueryBuilder('a');

    // filters
    if (filter?.nama) {
      qb.andWhere('a.nama ILIKE :nama', { nama: `%${filter.nama}%` });
    }
    if (filter?.status) {
      qb.andWhere('a.status = :status', { status: filter.status });
    }
    if (filter?.jabatan) {
      const arr = filter.jabatan.split(',').map(s => s.trim());
      qb.andWhere('a.jabatan IN (:...jabatan)', { jabatan: arr });
    }

    // sorting
    const sortBy = filter?.sortBy ?? 'updated_at';
    const order = (filter?.order ?? 'DESC').toUpperCase() as 'ASC'|'DESC';
    qb.orderBy(`a.${sortBy}`, order);

    // pagination
    const page = Math.max(1, Number(filter?.page ?? 1));
    const limit = Math.min(100, Number(filter?.limit ?? 20));
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Aparat> {
    const item = await this.repo.findOne({ where: { id_aparat: id } });
    if (!item) throw new NotFoundException('Aparat not found');
    return item;
  }

  async update(id: string, dto: UpdateAparatDto) {
    await this.ensureUniqueNikNip(dto.nik, dto.nip, id);
    const item = await this.findOne(id);
    Object.assign(item, dto);
    item.version = (item.version ?? 1) + 1;
    const saved = await this.repo.save(item);
    // emit event for other modules to invalidate cache
    this.eventEmitter.emit('aparat.updated', { id: saved.id_aparat, updated_at: saved.updated_at });
    return saved;
  }

  async patchStatus(id: string, status: string) {
    const item = await this.findOne(id);
    item.status = status as any;
    item.version = (item.version ?? 1) + 1;
    const saved = await this.repo.save(item);
    this.eventEmitter.emit('aparat.updated', { id: saved.id_aparat, status: saved.status });
    return saved;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    this.eventEmitter.emit('aparat.deleted', { id });
  }
}
