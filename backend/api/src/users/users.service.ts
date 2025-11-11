import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by username (for login)
   * Note: pasword included for bcrypt compare
   */

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password') //select password
      .getOne();
  }

  /**
   * Find user by email (preferred for authentication)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email }
    })
  }

  /**
   * Find user by ID (for JWT validation)
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * get all users for admin only
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**Create new user for registration
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      throw new ConflictException('Email atau username sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  /**
   * Update user data
   */

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateData.password) {
      delete updateData.password;
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  /**
   * Update password only 
   */

  async updatePassword(id: number, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void>{
    const result = await this.userRepository.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async validatePassword(password: string , plainPassword: string): Promise<boolean>  {
    return bcrypt.compare(plainPassword, password);

  }

  async logout(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    if (!user ) return false;

    await this.userRepository.update(id, {
      refresh_token: null
    })
    return true;
  }

}
