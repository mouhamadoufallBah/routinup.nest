import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RoutineTask } from './routine-task.entity';

@Entity()
export class TaskCompletion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: string;

    @ManyToOne(() => RoutineTask, (task) => task.completions, { onDelete: 'CASCADE' })
    routineTask: RoutineTask;
}
