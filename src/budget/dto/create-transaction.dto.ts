import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    accountId: number;

    @ApiProperty({ example: 'EXPENSE', description: 'INCOME or EXPENSE' })
    @IsString()
    @IsNotEmpty()
    type: string; // INCOME, EXPENSE

    @ApiProperty({ example: 50.5 })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'Alimentation' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 'Courses au supermarché', required: false })
    @IsString()
    @IsOptional()
    description: string;
}
