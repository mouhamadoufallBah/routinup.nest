import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string; // INCOME, EXPENSE

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn({ type: 'timestamp' })
    date: Date;

    @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
    account: Account;
}
