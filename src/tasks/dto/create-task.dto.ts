import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
    @ApiProperty({ example: 'Faire les courses' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Acheter du pain et du lait', required: false })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ example: '2025-12-25', required: false })
    @IsDateString()
    @IsOptional()
    dueDate: string;
}
