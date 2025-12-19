import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
    @ApiProperty({ example: 'Compte Courant' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'BANK', description: 'BANK, WAVE, CASH, SAVINGS' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ example: 1000 })
    @IsNumber()
    balance: number;
}
