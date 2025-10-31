import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
        .addSelect('user.password')//select password
        .getOne()
    }

    /**
     * Find user by ID (JWT validation)
     */

    async findById(id: number): Promise< User | null> {
        return this.userRepository.findOne({
            where: { id_user: id},
        });
    }

    /**
     * get all users for admin only 
     */
    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            order: { created_at: 'DESC'},
        });
    }

    /**Create new user for registration
     */
    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    /**
     * Update user data
     */

    async update(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.findById(id);
        if(!user){
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }
}