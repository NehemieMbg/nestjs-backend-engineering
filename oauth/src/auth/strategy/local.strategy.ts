import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Validate the user credentials.
   * @param username - The username provided by the user.
   * @param password - The password provided by the user.
   * @returns A promise that resolves to the user object if validation is successful.
   * @throws UnauthorizedException if the credentials are incorrect.
   */
  async validate(username: string, password: string): Promise<any> {
    const user: User | null = await this.authService.validateUser(
      username,
      password,
    );

    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }
    return user;
  }
}
