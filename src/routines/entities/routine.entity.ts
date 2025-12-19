import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RoutineTask } from './routine-task.entity';

@Entity()
export class Routine {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'date' })
    startDate: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isArchived: boolean;

    @Column({ default: 0 })
    streak: number;

    @Column({ type: 'date', nullable: true })
    lastCompletedDate: string;

    @ManyToOne(() => User, (user) => user.routines, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => RoutineTask, (task) => task.routine, { cascade: true })
    tasks: RoutineTask[];
}
