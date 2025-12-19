import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJournalDto {
    @IsString()
    @IsNotEmpty()
    learned: string;

    @IsString()
    @IsNotEmpty()
    wellDone: string;

    @IsString()
    @IsNotEmpty()
    toImprove: string;
}
