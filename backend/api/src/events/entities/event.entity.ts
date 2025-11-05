import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsEnum, IsJSON, Length } from 'class-validator';
import { EventTopic, EventStatus, SourceModule } from '../enums';
import { EventAcknowledgment } from './event-acknowledgement.entity';

/**
 * Event Entity
 *
 * Konsep: Representasi event dalam Event Bus
 *
 * Event Bus Pattern:
 * - Publisher (Surat/Aparat/Ekspedisi) publish event
 * - Event disimpan di tabel ini
 * - Consumer subscribe dan process event
 * - Acknowledgment dicatat di tabel terpisah
 */

@Entity('events')
@Index(['topic', 'timestamp'])
@Index(['status', 'timestamp'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EventTopic,
    nullable: false,
  })
  @Index()
  @IsEnum(EventTopic, { message: 'Topix harus salah satu dari EventTopic' })
  @IsNotEmpty({ message: 'Topik tidak boleh kosong' })
  topic: EventTopic;

  /**
   * Event Payload
   *
   * @Column({ type: 'jsonb' }): Simpan data sebagai JSON di PostgreSQL
   * JSONB (binary JSON) lebih cepat untuk query dibanding TEXT
   *
   * Contoh payload:
   * {
   *   "surat_id": 123,
   *   "old_status": "DRAFT",
   *   "new_status": "TERKIRIM",
   *   "changed_by": "admin"
   * }
   */

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  @IsJSON({
    message: 'Payload harus berupa JSON valid',
  })
  payload?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: SourceModule,
    nullable: false,
  })
  @Index()
  @IsEnum(SourceModule, {
    message: 'Source Module hari berasal dari SourceModule enum',
  })
  @IsNotEmpty({ message: 'Source module tidak boleh kosongg' })
  source_module: SourceModule;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @Index()
  @Length(1, 255, { message: 'Idempotency key maksimal 255 char' })
  @IsNotEmpty({ message: 'Idempotency key tidak boleh kosong' })
  idempotency_key: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
    nullable: false,
  })
  @Index()
  @IsEnum(EventStatus, {
    message: 'Status harus salah satu dari EventStatus enum',
  })
  status: EventStatus;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  @Index() // ✅ Index untuk sorting by time
  timestamp: Date;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at: Date;


  /**
   * Relationship: Event has many Acknowledgments
   * 
   * @OneToMany(): One Event → Many Acknowledgments
   * 
   * Konsep:
   * - Satu event bisa di-consume oleh multiple modules
   * - Setiap consumer akan create acknowledgment record
   * 
   * Contoh:
   * Event "surat.statusChanged" di-consume oleh:
   * - Module Ekspedisi (create pengiriman)
   * - Module Notifikasi (send notification)
   */
  @OneToMany(() => EventAcknowledgment, (ack) => ack.event, { cascade: true })
  acknowledgments: EventAcknowledgment[];
}//cascading delete jika event dihapus dan juga chaining delete ke acknowledgmentnya

export class EventEntity {}
