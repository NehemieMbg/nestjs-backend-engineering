import { Expose } from 'class-transformer';

/**
 * User Data Transfer Object
 */
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  username: string;
}
