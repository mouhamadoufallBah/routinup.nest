import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Routine } from './routine.entity';
import { TaskCompletion } from './task-completion.entity';

@Entity()
export class RoutineTask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    time: string;

    @Column()
    recurrence: string;

    @ManyToOne(() => Routine, (routine) => routine.tasks, { onDelete: 'CASCADE' })
    routine: Routine;

    @OneToMany(() => TaskCompletion, (completion) => completion.routineTask, { cascade: true })
    completions: TaskCompletion[];
}
