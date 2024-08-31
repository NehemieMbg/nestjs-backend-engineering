import { IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for resetting a password.
 */
export class ResetPasswordDto {
  @IsString()
  resetToken: string;

  @MinLength(6, {
    message: 'The password must be at least 6 characters long.',
  })
  newPassword: string;
}
