import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";

export enum UserRole{
    ADMIN = 'ADMIN', 
    OPERATOR = 'OPERATOR',
    VIEWER = 'VIEWER',
}


@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id_user: number;

    @Column({unique:true, length:50})
    username: string;

    // buat hash password nanti len 255
    @Column({length:255, select:false})
    password: string;

    @Column({
        type: "varchar", 
        length: 20, 
        default: UserRole.OPERATOR,
        })
    role: UserRole;

    @Column({length : 255})
    nama_lengkap:string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
    
    // exclude password dari response 
    toJSON() {
        const { password, ...result} = this;
        return result;
    }
}
