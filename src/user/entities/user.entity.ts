import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';

import { Routine } from '../../routines/entities/routine.entity';
import { JournalEntry } from '../../journal/entities/journal.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Account } from '../../budget/entities/account.entity';

@Entity()
export class User {
  @OneToMany(() => Routine, (routine) => routine.user)
  routines: Routine[];

  @OneToMany(() => JournalEntry, (entry) => entry.user)
  journalEntries: JournalEntry[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ default: false })
  isVerified: boolean;
}
