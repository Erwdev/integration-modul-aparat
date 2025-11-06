import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { ProcessingStatus, SourceModule } from '../enums';
import { Event } from './event.entity';

@Entity('events_acknowledgements')

export class EventAcknowledgment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column ({
    type: 'uuid',
    nullable: false,
  })
  @Index()
  event_id : string;

  @ManyToOne(()=> Event, (event) => event.acknowledgments, { onDelete: 'CASCADE', nullable: false, })
  @JoinColumn({name: 'event_id'})
  event: Event;

  @Column({
    type: 'enum',
    enum: SourceModule,
    nullable: false,
  })
  @Index()
  @IsEnum(SourceModule, {message: 'consumer module harus salah satu dari SourceModule'})
  @IsNotEmpty({message: 'Consumer module tidak boleh kosong'})
  consumer_module: SourceModule;

  @CreateDateColumn({
    type: 'timestamptz',
  })acknowledged_at: Date;


  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    nullable: false,
  })
  @Index()
  @IsEnum(ProcessingStatus)
  @IsNotEmpty()
  processing_status: ProcessingStatus


  @Column({
    type: 'text',
    nullable: true,
  })
  @IsOptional()
  @Length(0,1000, {message: 'Maximum error message reached in table'})
  error_message?: string;

}










/**
 * Event Acknowledgment Entity
 * 
 * Konsep: Tracking siapa saja yang sudah memproses event
 * 
 * Use case:
 * - Event "surat.statusChanged" published oleh Agenda module
 * - Ekspedisi module consume → create acknowledgment (success)
 * - Notifikasi module consume → create acknowledgment (failed)
 */