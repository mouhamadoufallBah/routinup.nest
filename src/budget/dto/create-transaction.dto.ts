import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateTransactionDto {
    @IsNumber()
    accountId: number;

    @IsString()
    @IsNotEmpty()
    type: string; // INCOME, EXPENSE

    @IsNumber()
    amount: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    description: string;
}
