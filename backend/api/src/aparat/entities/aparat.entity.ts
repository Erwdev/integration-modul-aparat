import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusAparat } from '../enums/status-aparat.enum';
import { Jabatan } from '../enums/jabatan.enum';

@Entity('aparat_desa')
export class Aparat {
  // Mapping ID
  @PrimaryGeneratedColumn('uuid', { name: 'id_aparat' })
  id: string;

  // Mapping CamelCase -> Snake_Case Database
  @Column({ type: 'int', unique: true, name: 'nomor_urut' })
  nomorUrut: number;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  nip?: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  nik: string;

  @Column({ type: 'varchar', length: 1, name: 'jenis_kelamin' })
  jenisKelamin: 'L' | 'P';

  @Column({ type: 'varchar', length: 100, name: 'tempat_lahir' })
  tempatLahir: string;

  @Column({ type: 'date', name: 'tanggal_lahir' })
  tanggalLahir: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  agama?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'pangkat_golongan' })
  pangkatGolongan?: string;

  @Column({ type: 'varchar', length: 100 })
  jabatan: Jabatan | string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'pendidikan_terakhir' })
  pendidikanTerakhir?: string;

  // Simpan nomor SK sebagai string
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nomor_tanggal_keputusan_pengangkatan' })
  skPengangkatan?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nomor_tanggal_keputusan_pemberhentian' })
  skPemberhentian?: string;

  @Column({ type: 'text', nullable: true })
  keterangan?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'tanda_tangan_url' })
  tandaTanganUrl?: string;

  @Column({
    type: 'enum',
    enum: StatusAparat,
    default: StatusAparat.AKTIF,
  })
  status: StatusAparat;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}