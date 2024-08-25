import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dto/user.dto';
import { Serialize } from '../users/interceptors/serialize.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @Serialize(UserDto)
  async signup(@Body() body: CreateUserDto): Promise<UserDto> {
    return this.authService.signup(body);
  }
}
