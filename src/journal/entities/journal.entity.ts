import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class JournalEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    date: Date;

    @Column({ type: 'text' })
    learned: string;

    @Column({ type: 'text' })
    wellDone: string;

    @Column({ type: 'text' })
    toImprove: string;

    @ManyToOne(() => User, (user) => user.journalEntries, { onDelete: 'CASCADE' })
    user: User;
}
