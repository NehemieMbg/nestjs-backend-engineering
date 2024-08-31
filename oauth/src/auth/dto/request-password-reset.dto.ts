import { IsEmail } from 'class-validator';

/**
 * Data Transfer Object for requesting a password reset.
 */
export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}
