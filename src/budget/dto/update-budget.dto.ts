import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-budget.dto';

export class UpdateBudgetDto extends PartialType(CreateAccountDto) { }
