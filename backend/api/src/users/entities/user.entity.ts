import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // Hide password by default in queries
  password: string;

  @Column()
  role: string;

  @Column()
  nama_lengkap: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      const hashedPassword = await bcrypt.hash(this.password, 10); //adding check if the password already hashed
      this.password = hashedPassword; // Use the variable
    }
  }
  // fixing password update flow should be through service to simplify hook

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
  //sementara linter disable

  // toJSON() {
  //   const { password, ...result } = this;
  //   return result;
  // }
}
