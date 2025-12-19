import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreateRoutineTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    time: string; // HH:MM format

    @IsString()
    recurrence: string;
}

export class CreateRoutineDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    startDate: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRoutineTaskDto)
    tasks: CreateRoutineTaskDto[];
}
