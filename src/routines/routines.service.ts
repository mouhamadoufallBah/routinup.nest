import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

  async create(user: any, createRoutineDto: CreateRoutineDto) {
    const userId = user.userId;
    // Check if user has an active routine
    const activeRoutine = await this.routineRepository.findOne({
      where: { user: { id: userId }, isActive: true },
    });

    if (activeRoutine) {
      throw new BadRequestException('You already have an active routine. Please archive it before creating a new one.');
    }

    const routine = this.routineRepository.create({
      ...createRoutineDto,
      isActive: true,
      user: { id: userId } as any,
    });

    return this.routineRepository.save(routine);
  }

  async findAllActive(user: any) {
    const today = new Date().toISOString().split('T')[0];

    const routine = await this.routineRepository.findOne({
      where: { user: { id: user.userId }, isActive: true },
      relations: ['tasks'],
    });

    if (!routine) {
      return null;
    }

    // Load today's completions for all tasks
    const tasksWithCompletion = await Promise.all(
      routine.tasks.map(async (task) => {
        const completion = await this.routineRepository.manager.findOne(TaskCompletion, {
          where: {
            routineTask: { id: task.id },
            completedAt: Between(new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59'))
          },
        });

        return {
          ...task,
          isCompletedToday: !!completion,
        };
      })
    );

    return {
      ...routine,
      tasks: tasksWithCompletion,
    };
  }

  findAll() {
    return this.routineRepository.find({
      relations: ['tasks'],
    });
  }

  async findOne(id: number) {
    const routine = await this.routineRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!routine) {
      throw new BadRequestException(`Routine #${id} not found`);
    }
    return routine;
  }

  async update(id: number, updateRoutineDto: UpdateRoutineDto) {
    const routine = await this.findOne(id);
    Object.assign(routine, updateRoutineDto);
    return this.routineRepository.save(routine);
  }

  async remove(id: number) {
    const routine = await this.findOne(id);
    return this.routineRepository.remove(routine);
  }

  async archive(id: number, user: any) {
    const routine = await this.routineRepository.findOne({
      where: { id, user: { id: user.userId } },
    });

    if (!routine) {
      throw new BadRequestException('Routine not found');
    }

    routine.isArchived = true;
    return this.routineRepository.save(routine);
  }

  async checkTask(taskId: number, user: any) {
    const today = new Date().toISOString().split('T')[0];

    // Verify task belongs to user
    const task = await this.routineRepository.manager.findOne(RoutineTask, {
      where: { id: taskId, routine: { user: { id: user.userId } } },
      relations: ['routine'],
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Check if already completed today
    const existing = await this.routineRepository.manager.findOne(TaskCompletion, {
      where: {
        routineTask: { id: taskId },
        completedAt: Between(new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59'))
      },
    });

    if (existing) {
      return existing; // Already checked
    }

    const completion = this.routineRepository.manager.create(TaskCompletion, {
      routineTask: task,
      completedAt: new Date(),
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
        const completedToday = t.completions.some(c => new Date(c.completedAt).toISOString().split('T')[0] === today);
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
        where: {
          routineTask: { routine: { id: routine.id } },
          completedAt: Between(new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59'))
        }
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
          where: {
            routineTask: { id: t.id },
            completedAt: Between(new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59'))
          }
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

  async uncheckTask(taskId: number, user: any) {
    const today = new Date().toISOString().split('T')[0];

    // Verify task belongs to user
    const task = await this.routineRepository.manager.findOne(RoutineTask, {
      where: { id: taskId, routine: { user: { id: user.userId } } },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    const completion = await this.routineRepository.manager.findOne(TaskCompletion, {
      where: {
        routineTask: { id: taskId },
        completedAt: Between(new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59'))
      },
    });

    if (completion) {
      await this.routineRepository.manager.remove(completion);
    }

    return { success: true };
  }

  async getHistory(id: number, user: any) {
    const routine = await this.routineRepository.findOne({
      where: { id, user: { id: user.userId } },
      relations: ['tasks'],
    });

    if (!routine) {
      throw new BadRequestException('Routine not found');
    }

    const startDate = new Date(routine.startDate);
    const today = new Date();
    const history: Array<{
      date: string;
      tasksCompleted: number;
      totalTasks: number;
      isFullyCompleted: boolean;
    }> = [];

    // Iterate through each day from start to today
    for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];

      // Count completions for this date
      const completions = await this.routineRepository.manager.count(TaskCompletion, {
        where: {
          routineTask: { routine: { id: routine.id } },
          completedAt: Between(new Date(dateStr + ' 00:00:00'), new Date(dateStr + ' 23:59:59'))
        },
      });

      const totalTasks = routine.tasks.length;
      const isFullyCompleted = completions === totalTasks && totalTasks > 0;

      history.push({
        date: dateStr,
        tasksCompleted: completions,
        totalTasks,
        isFullyCompleted,
      });
    }

    return {
      routineId: routine.id,
      routineName: routine.name,
      startDate: routine.startDate,
      currentStreak: routine.streak,
      history,
    };
  }
}
