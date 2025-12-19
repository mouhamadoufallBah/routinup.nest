import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string; // BANK, WAVE, CASH, SAVINGS

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    balance: number;

    @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.account)
    transactions: Transaction[];
}
