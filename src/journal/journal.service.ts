import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { JournalEntry } from './entities/journal.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JournalService {
    constructor(
        @InjectRepository(JournalEntry)
        private journalRepository: Repository<JournalEntry>,
    ) { }

    async create(user: User, createJournalDto: CreateJournalDto) {
        const entry = this.journalRepository.create({
            ...createJournalDto,
            user,
        });
        return this.journalRepository.save(entry);
    }

    async findAll(user: User) {
        return this.journalRepository.find({
            where: { user: { id: user.id } },
            order: { date: 'DESC' }
        });
    }

    async findOne(id: number, user: User) {
        const entry = await this.journalRepository.findOne({
            where: { id, user: { id: user.id } }
        });
        if (!entry) {
            throw new NotFoundException(`Journal entry #${id} not found`);
        }
        return entry;
    }

    async update(id: number, user: User, updateJournalDto: UpdateJournalDto) {
        const entry = await this.findOne(id, user);
        Object.assign(entry, updateJournalDto);
        return this.journalRepository.save(entry);
    }

    async remove(id: number, user: User) {
        const entry = await this.findOne(id, user);
        return this.journalRepository.remove(entry);
    }
}
