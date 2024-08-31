import { Expose } from 'class-transformer';

/**
 * Data Transfer Object for authentication.
 */
export class AuthDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  accessToken: string;
}
