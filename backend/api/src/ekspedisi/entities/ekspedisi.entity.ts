import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { Surat } from '../../surat/entities/surat.entity';


@Entity('ekspedisi')
export class Ekspedisi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ Add relation to Surat
  @Column({ type: 'uuid', name: 'surat_id' })
  surat_id: string;

  @ManyToOne(() => Surat, { eager: true })
  @JoinColumn({ name: 'surat_id' })
  surat: Surat;

  @Column({ type: 'varchar', length: 255, unique: true })
  nomor_resi: string;

  @Column({ type: 'varchar', length: 255 })
  kurir: string;

  @Column({ type: 'text' })
  tujuan: string;

  @Column({
    type: 'enum',
    enum: StatusEkspedisi,
    default: StatusEkspedisi.DALAM_PERJALANAN,
  })
  status: StatusEkspedisi;

  // ✅ Add bukti terima fields
  @Column({ type: 'varchar', length: 500, nullable: true })
  bukti_terima_path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_penerima: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggal_terima: Date;

  // ✅ Add catatan for tracking
  @Column({ type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
