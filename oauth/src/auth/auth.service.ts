import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signup(body: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(body);

    if (!user) {
      throw new BadRequestException('User already exists');
    }

    return user;
  }
}
