import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Serialize } from '../users/interceptors/serialize.interceptor';
import { AuthDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param body - User data
   */
  @Post('/sign-up')
  @Serialize(AuthDto)
  async register(@Body() body: CreateUserDto): Promise<AuthDto> {
    return this.authService.signup(body);
  }

  /**
   * Login a user
   * @param request - Request object
   */
  @Post('/sign-in')
  @UseGuards(LocalAuthGuard)
  async login(@Request() request): Promise<AuthDto> {
    return this.authService.signIn(request.user);
  }

  /**
   * Get the current user
   * @param request - Request object
   */
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request) {
    return request.user;
  }

  /**
   * Initiates the Google OAuth2 login flow
   */
  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  /**
   * Callback for the Google OAuth2 login flow
   * @param request - Request object
   */
  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() request) {
    return this.authService.googleSignIn(request);
  }

  @Post('/request-password-reset')
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestPasswordReset(body.email);
  }

  @Post('/reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(
    @Request() request,
    @Body() body: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(
      request.user.username,
      body.newPassword,
      body.resetToken,
    );
  }
}
