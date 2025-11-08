import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { JenisSurat } from '../enums/jenis-surat.enum';
import { StatusSurat } from '../enums/status-surat.enum';

@Entity('surat')
export class Surat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  nomor_surat: string;

  @Column({
    type: 'enum',
    enum: JenisSurat,
    nullable: false,
  })
  jenis: JenisSurat;

  @Column({ length: 500 })
  perihal: string;

  @Column({ type: 'date' })
  tanggal_surat: Date;

  @Column({ nullable: true, length: 255 })
  pengirim?: string;

  @Column({ nullable: true, length: 255 })
  penerima?: string;

  @Column({ nullable: true, type: 'uuid' })
  id_aparat_penandatangan?: string;

  @Column({
    type: 'enum',
    enum: StatusSurat,
    default: StatusSurat.DRAFT,
  })
  status: StatusSurat;

  @Column({ type: 'text', nullable: true })
  isi_ringkas?: string;

  @Column({ nullable: true, length: 500 })
  lampiran_url?: string;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true, length: 100 })
  etag?: string;

  @DeleteDateColumn()
  deleted_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true, type: 'uuid' })
  created_by?: string;

  @Column({ nullable: true, type: 'uuid' })
  updated_by?: string;

  @BeforeInsert()
  generateETag() {
    const crypto = require('crypto');
    this.etag = crypto
      .createHash('md5')
      .update(`${this.id}-${Date.now()}-${this.version}`)
      .digest('hex');
  }

  @BeforeUpdate()
  updateMetadata() {
    this.version += 1;
    const crypto = require('crypto');
    this.etag = crypto
      .createHash('md5')
      .update(`${this.id}-${Date.now()}-${this.version}`)
      .digest('hex');
  }

  // Helper method untuk validasi state transition
  canTransitionTo(newStatus: StatusSurat): boolean {
    const transitions: Record<StatusSurat, StatusSurat[]> = {
      [StatusSurat.DRAFT]: [StatusSurat.TERKIRIM],
      [StatusSurat.TERKIRIM]: [StatusSurat.DITERIMA],
      [StatusSurat.DITERIMA]: [StatusSurat.SELESAI],
      [StatusSurat.SELESAI]: [],
    };

    return transitions[this.status]?.includes(newStatus) ?? false;
  }

  // Helper method untuk check apakah bisa diubah
  canBeModified(): boolean {
    return this.status === StatusSurat.DRAFT;
  }

  // Helper method untuk check apakah bisa dihapus
  canBeDeleted(): boolean {
    return this.status === StatusSurat.DRAFT;
  }
}