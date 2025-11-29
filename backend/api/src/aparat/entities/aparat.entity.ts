import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeUpdate,
  Generated,
} from 'typeorm';
import { StatusAparat } from '../enums/status-aparat.enum';
import { Jabatan } from '../enums/jabatan.enum';

@Entity('aparat_desa')
export class Aparat {
  @PrimaryGeneratedColumn('uuid')
  id_aparat: string;

  // @Column({ type: 'int', unique: true })
  // nomor_urut: number;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  nip?: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  nik: string;

  @Column({ type: 'varchar', length: 1 })
  jenis_kelamin: 'L' | 'P';

  @Column({ type: 'varchar', length: 100 })
  tempat_lahir: string;

  @Column({ type: 'date' })
  tanggal_lahir: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  agama?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pangkat_golongan?: string;

  @Column({ type: 'varchar', length: 100 })
  jabatan: Jabatan | string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pendidikan_terakhir?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomor_tanggal_keputusan_pengangkatan?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomor_tanggal_keputusan_pemberhentian?: string;

  @Column({ type: 'text', nullable: true })
  keterangan?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tanda_tangan_url?: string;

  @Column({
    type: 'enum',
    enum: StatusAparat,
    default: StatusAparat.AKTIF,
  })
  status: StatusAparat;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
