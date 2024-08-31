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
   * Register a new user.
   * @param body - The user data for registration.
   * @returns A promise that resolves to the authenticated user data transfer object.
   */
  @Post('/sign-up')
  @Serialize(AuthDto)
  async register(@Body() body: CreateUserDto): Promise<AuthDto> {
    return this.authService.signup(body);
  }

  /**
   * Login a user.
   * @param request - The request object containing user information.
   * @returns A promise that resolves to the authenticated user data transfer object.
   */
  @Post('/sign-in')
  @UseGuards(LocalAuthGuard)
  async login(@Request() request): Promise<AuthDto> {
    return this.authService.signIn(request.user);
  }

  /**
   * Get the current user profile.
   * @param request - The request object containing user information.
   * @returns The current authenticated user.
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
   * Callback for the Google OAuth2 login flow.
   * @param request - The request object containing user information.
   * @returns The authenticated user data.
   */
  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() request) {
    return this.authService.googleSignIn(request);
  }

  /**
   * Request a password reset.
   * @param body - The request body containing the email.
   * @returns A promise that resolves to a message indicating the result of the request.
   */
  @Post('/request-password-reset')
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestPasswordReset(body.email);
  }

  /**
   * Reset the user's password.
   * @param request - The request object containing user information.
   * @param body - The request body containing the new password and reset token.
   * @returns A promise that resolves to a message indicating the result of the password reset.
   */
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
