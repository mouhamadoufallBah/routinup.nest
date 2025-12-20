import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoutineTask } from './routine-task.entity';

@Entity()
export class TaskCompletion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => RoutineTask, (task) => task.completions, { onDelete: 'CASCADE' })
    routineTask: RoutineTask;
}
