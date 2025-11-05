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