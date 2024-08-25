import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'Wrong Credentials',
  })
  password: string;
}
