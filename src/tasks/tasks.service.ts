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

    async create(user: User, createTaskDto: CreateTaskDto) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            user,
        });
        return this.tasksRepository.save(task);
    }

    async findAll(user: User) {
        return this.tasksRepository.find({
            where: { user: { id: user.id } },
        });
    }

    async findOne(id: number, user: User) {
        const task = await this.tasksRepository.findOne({
            where: { id, user: { id: user.id } },
        });
        if (!task) {
            throw new NotFoundException(`Task #${id} not found`);
        }
        return task;
    }

    async update(id: number, user: User, updateTaskDto: UpdateTaskDto) {
        const task = await this.findOne(id, user);
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async remove(id: number, user: User) {
        const task = await this.findOne(id, user);
        return this.tasksRepository.remove(task);
    }

    async toggleComplete(id: number, user: User) {
        const task = await this.findOne(id, user);
        task.isCompleted = !task.isCompleted;
        return this.tasksRepository.save(task);
    }
}
