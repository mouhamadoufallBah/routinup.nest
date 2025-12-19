import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-budget.dto';

export class UpdateBudgetDto extends PartialType(CreateAccountDto) { }
