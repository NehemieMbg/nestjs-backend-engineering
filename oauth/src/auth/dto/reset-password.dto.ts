import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(6, {
    message: 'The password must be at least 6 characters long.',
  })
  newPassword: string;
}
