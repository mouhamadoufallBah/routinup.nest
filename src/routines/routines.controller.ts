import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) { }

  @Post()
  create(@Request() req, @Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(req.user, createRoutineDto);
  }

  @Get('active')
  findActive(@Request() req) {
    return this.routinesService.findAllActive(req.user);
  }

  @Post('tasks/:id/check')
  checkTask(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.routinesService.checkTask(id, req.user);
  }

  @Post('tasks/:id/uncheck')
  uncheckTask(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.routinesService.uncheckTask(id, req.user);
  }

  @Patch(':id/archive')
  archive(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.routinesService.archive(id, req.user);
  }

  @Get()
  findAll() {
    return this.routinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routinesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoutineDto: UpdateRoutineDto) {
    return this.routinesService.update(+id, updateRoutineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routinesService.remove(+id);
  }
}
