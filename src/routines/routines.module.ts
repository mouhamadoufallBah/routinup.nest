import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './entities/routine.entity';
import { RoutineTask } from './entities/routine-task.entity';
import { TaskCompletion } from './entities/task-completion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineTask, TaskCompletion])],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule { }
