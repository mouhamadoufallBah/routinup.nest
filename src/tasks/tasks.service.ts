import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async create(user: any, createTaskDto: CreateTaskDto) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            user: { id: user.userId } as any,
        });
        return this.tasksRepository.save(task);
    }

    async findAll(user: any) {
        return this.tasksRepository.find({
            where: { user: { id: user.userId } },
        });
    }

    async findOne(id: number, user: any) {
        const task = await this.tasksRepository.findOne({
            where: { id, user: { id: user.userId } },
        });
        if (!task) {
            throw new NotFoundException(`Task #${id} not found`);
        }
        return task;
    }

    async update(id: number, user: any, updateTaskDto: UpdateTaskDto) {
        const task = await this.findOne(id, user);
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async remove(id: number, user: any) {
        const task = await this.findOne(id, user);
        return this.tasksRepository.remove(task);
    }

    async toggleComplete(id: number, user: any) {
        const task = await this.findOne(id, user);
        task.isCompleted = !task.isCompleted;
        return this.tasksRepository.save(task);
    }
}
