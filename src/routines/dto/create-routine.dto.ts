import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateRoutineTaskDto {
    @ApiProperty({ example: 'Méditation' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: '07:00' })
    @IsString()
    @IsNotEmpty()
    time: string; // HH:MM format

    @ApiProperty({ example: 'DAILY' })
    @IsString()
    recurrence: string;
}

export class CreateRoutineDto {
    @ApiProperty({ example: 'Ma Routine Matinale' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '2025-12-25' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-12-30' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ type: [CreateRoutineTaskDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRoutineTaskDto)
    tasks: CreateRoutineTaskDto[];
}
