import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_bans')
export class UserBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  userId: number;

  @Column({ type: 'int', default: 0 })
  violationCount: number;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  banExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}