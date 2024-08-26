import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Serialize } from '../users/interceptors/serialize.interceptor';
import { AuthDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { TwitterOAuthGuard } from './guards/twitter-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @Serialize(AuthDto)
  async register(@Body() body: CreateUserDto): Promise<AuthDto> {
    return this.authService.signup(body);
  }

  @Post('/sign-in')
  @UseGuards(LocalAuthGuard)
  async login(@Request() request): Promise<AuthDto> {
    return this.authService.signIn(request.user);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request) {
    return request.user;
  }

  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() request) {
    return this.authService.googleSignIn(request);
  }
}
