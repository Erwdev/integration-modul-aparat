import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { JenisPengiriman } from '../enums/jenis-pengiriman.enum';

@Entity('ekspedisi')
export class Ekspedisi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  surat_id: string;

  @Column({ nullable: false })
  kurir: string;

  @Column({ nullable: true })
  petugas_aparat_id: string;

  @Column({ type: 'date', nullable: false })
  tanggal_kirim: Date;

  @Column({
    type: 'enum',
    enum: JenisPengiriman,
    default: JenisPengiriman.INTERNAL,
  })
  metode_kirim: JenisPengiriman;

  @Column({
    type: 'enum',
    enum: StatusEkspedisi,
    default: StatusEkspedisi.DALAM_PERJALANAN,
  })
  status: StatusEkspedisi;

  @Column({ nullable: true })
  bukti_terima_url?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
