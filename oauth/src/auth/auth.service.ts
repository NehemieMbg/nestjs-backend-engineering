import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../users/password.service';
import { AuthDto } from './dto/auth.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async signup(body: CreateUserDto): Promise<AuthDto> {
    const user = await this.userService.createUser(body);

    if (!user) {
      throw new BadRequestException('User already exists');
    }

    const accessToken = await this.generateToken(user.id, user.username);

    return {
      id: user.id,
      username: user.username,
      accessToken,
    };
  }

  async signIn(user: User): Promise<AuthDto> {
    const accessToken = await this.generateToken(user.id, user.username);

    return {
      id: user.id,
      username: user.username,
      accessToken,
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (
      user &&
      (await this.passwordService.compare(password, user?.password))
    ) {
      return user;
    }

    return null;
  }

  /**
   * Generate a jwt token
   * @param id - The user id
   * @param username - The username of the user
   * @returns generated token
   */
  private async generateToken(id: number, username: string): Promise<string> {
    const payload = { sub: id, username: username };
    return await this.jwtService.signAsync(payload);
  }
}
