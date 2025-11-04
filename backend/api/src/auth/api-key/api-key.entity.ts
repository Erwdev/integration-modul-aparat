import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key_hash: string;

  @Column({ nullable: true })
  owner: string;

  @Column('text', { array: true, nullable: true })
  ip_allowlist: string[];

  @CreateDateColumn()
  created_at: Date;
}
