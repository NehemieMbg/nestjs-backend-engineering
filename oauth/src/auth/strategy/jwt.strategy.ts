import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface JwtPayload {
  sub: string;
  username: string;
}

type UserObject = {
  firstName: string;
  lastName: string;
  userId: string;
  username: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validate the JWT payload and return the user object.
   * @param payload - The JWT payload containing user information.
   * @returns A promise that resolves to the user object.
   */
  async validate(payload: JwtPayload): Promise<UserObject> {
    const user: User | null = await this.userService.findOne(payload.username);

    return {
      userId: payload.sub,
      firstName: user.firstName,
      lastName: user.lastName,
      username: payload.username,
    };
  }
}
