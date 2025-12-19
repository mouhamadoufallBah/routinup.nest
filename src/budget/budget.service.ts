import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) { }

  createAccount(user: any, createAccountDto: CreateAccountDto) {
    const account = this.accountRepository.create({
      ...createAccountDto,
      user: { id: user.userId } as any,
    });
    return this.accountRepository.save(account);
  }

  findAllAccounts(user: any) {
    return this.accountRepository.find({
      where: { user: { id: user.userId } },
    });
  }

  async createTransaction(user: any, createTransactionDto: CreateTransactionDto) {
    const { accountId, amount, type } = createTransactionDto;

    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: user.userId } },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      account,
    });

    // Update balance
    // Ensure amount is handled correctly as number
    const txAmount = Number(amount);

    if (type === 'INCOME') {
      account.balance = Number(account.balance) + txAmount;
    } else if (type === 'EXPENSE') {
      account.balance = Number(account.balance) - txAmount;
    }

    await this.accountRepository.save(account);
    return this.transactionRepository.save(transaction);
  }

  findAllTransactions(user: any) {
    return this.transactionRepository.find({
      where: { account: { user: { id: user.userId } } },
      order: { date: 'DESC' },
      relations: ['account'],
    });
  }

  create(createBudgetDto: CreateAccountDto) {
    return 'This action adds a new budget';
  }

  findAll() {
    return `This action returns all budget`;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`;
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
