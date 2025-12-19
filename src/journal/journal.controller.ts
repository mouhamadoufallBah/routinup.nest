import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
    constructor(private readonly journalService: JournalService) { }

    @Post()
    create(@Request() req, @Body() createJournalDto: CreateJournalDto) {
        return this.journalService.create(req.user, createJournalDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.journalService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.journalService.findOne(id, req.user);
    }

    @Patch(':id')
    update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() updateJournalDto: UpdateJournalDto) {
        return this.journalService.update(id, req.user, updateJournalDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.journalService.remove(id, req.user);
    }
}
