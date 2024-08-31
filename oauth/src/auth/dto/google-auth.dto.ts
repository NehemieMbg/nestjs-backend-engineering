/**
 * Data Transfer Object for Google authentication.
 */
export class GoogleAuthDto {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
