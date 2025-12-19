import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateAccountDto } from './dto/create-budget.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto'; // Assuming you create this DTO import
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) { }

  @Post('accounts')
  createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    return this.budgetService.createAccount(req.user, createAccountDto);
  }

  @Get('accounts')
  findAllAccounts(@Request() req) {
    return this.budgetService.findAllAccounts(req.user);
  }

  @Post('transactions')
  createTransaction(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.budgetService.createTransaction(req.user, createTransactionDto);
  }

  @Get('transactions')
  findAllTransactions(@Request() req) {
    return this.budgetService.findAllTransactions(req.user);
  }
}
