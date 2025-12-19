import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Routine } from './entities/routine.entity';
import { User } from '../user/entities/user.entity';
import { RoutineTask } from './entities/routine-task.entity';
import { TaskCompletion } from './entities/task-completion.entity';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
  ) { }

  async create(user: User, createRoutineDto: CreateRoutineDto) {
    // Check if user has an active routine
    const activeRoutine = await this.routineRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
    });

    if (activeRoutine) {
      throw new BadRequestException('You already have an active routine. Please archive it before creating a new one.');
    }

    const routine = this.routineRepository.create({
      ...createRoutineDto,
      isActive: true,
      user,
    });

    return this.routineRepository.save(routine);
  }

  async findAllActive(user: User) {
    return this.routineRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
      relations: ['tasks'],
    });
  }

  findAll() {
    return `This action returns all routines`;
  }

  findOne(id: number) {
    return `This action returns a #${id} routine`;
  }

  update(id: number, updateRoutineDto: UpdateRoutineDto) {
    return `This action updates a #${id} routine`;
  }

  async remove(id: number) {
    return `This action removes a #${id} routine`;
  }

  async archive(id: number, user: User) {
    const routine = await this.routineRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!routine) {
      throw new BadRequestException('Routine not found');
    }

    routine.isArchived = true;
    return this.routineRepository.save(routine);
  }

  async checkTask(taskId: number, user: User) {
    const today = new Date().toISOString().split('T')[0];

    // Verify task belongs to user
    const task = await this.routineRepository.manager.findOne(RoutineTask, {
      where: { id: taskId, routine: { user: { id: user.id } } },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Check if already completed today
    const existing = await this.routineRepository.manager.findOne(TaskCompletion, {
      where: { routineTask: { id: taskId }, date: today },
    });

    if (existing) {
      return existing; // Already checked
    }

    const completion = this.routineRepository.manager.create(TaskCompletion, {
      routineTask: task,
      date: today,
    });

    await this.routineRepository.manager.save(completion);

    // Check if all tasks for this routine are completed today
    const routine = await this.routineRepository.findOne({
      where: { id: task.routine.id },
      relations: ['tasks', 'tasks.completions'],
    });

    if (routine) {
      const allTasksCompleted = routine.tasks.every(t => {
        // Find completion for today
        // Note: t.completions might differ if not loaded with query builder filtering, 
        // but finding in array is acceptable for small task lists
        const completedToday = t.completions.some(c => c.date === today || new Date(c.date).toISOString().split('T')[0] === today);
        return completedToday;
        // Logic gap: The just-added completion might not be in 'routine.tasks' if we rely on standard find relation loading 
        // without refreshing. But TypeORM find should fetch fresh data if we just saved the completion? 
        // Actually relations load separate queries usually. 
        // Better: count tasks vs count completions today for this routine.
      });

      // Simplified logic for reliability:
      const taskCount = await this.routineRepository.manager.count(RoutineTask, {
        where: { routine: { id: routine.id } }
      });
      const completionCount = await this.routineRepository.manager.count(TaskCompletion, {
        where: { routineTask: { routine: { id: routine.id } }, date: today }
      });

      if (taskCount === completionCount + 1 || (taskCount === completionCount)) {
        // We just added one, so if count matches, we are good.
        // Wait, 'completion' is saved. validation above ensures it wasn't there. 
        // So completionCount should equal taskCount now.
      }

      // Let's re-query properly
      const tasks = await this.routineRepository.manager.find(RoutineTask, {
        where: { routine: { id: routine.id } }
      });

      let completedCount = 0;
      for (const t of tasks) {
        const c = await this.routineRepository.manager.findOne(TaskCompletion, {
          where: { routineTask: { id: t.id }, date: today }
        });
        if (c) completedCount++;
      }

      if (tasks.length === completedCount) {
        // All done! Update streak.
        if (routine.lastCompletedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (routine.lastCompletedDate === yesterdayStr) {
            routine.streak += 1;
          } else {
            routine.streak = 1;
          }
          routine.lastCompletedDate = today;
          await this.routineRepository.save(routine);
        }
      }
    }

    return completion;
  }

  async uncheckTask(taskId: number, user: User) {
    const today = new Date().toISOString().split('T')[0];

    // Verify task belongs to user
    const task = await this.routineRepository.manager.findOne(RoutineTask, {
      where: { id: taskId, routine: { user: { id: user.id } } },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    const completion = await this.routineRepository.manager.findOne(TaskCompletion, {
      where: { routineTask: { id: taskId }, date: today },
    });

    if (completion) {
      await this.routineRepository.manager.remove(completion);
    }

    return { success: true };
  }
}
