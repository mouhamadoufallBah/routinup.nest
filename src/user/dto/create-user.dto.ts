import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  password: string;
}
