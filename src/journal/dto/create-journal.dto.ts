import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJournalDto {
    @ApiProperty({ example: 'Le module Swagger est facile à utiliser.' })
    @IsString()
    @IsNotEmpty()
    learned: string;

    @ApiProperty({ example: 'J\'ai bien avancé sur les DTOs.' })
    @IsString()
    @IsNotEmpty()
    wellDone: string;

    @ApiProperty({ example: 'Je dois être plus attentif aux types de retour.' })
    @IsString()
    @IsNotEmpty()
    toImprove: string;
}
