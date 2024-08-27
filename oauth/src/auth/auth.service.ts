import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../users/password.service';
import { AuthDto } from './dto/auth.dto';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Create a new user
   * @param body - The user data
   * @returns The user info and access token
   */
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

  /**
   * Sign in a user
   * @param user - The user info
   * @returns The user info and access token
   */
  async signIn(user: User): Promise<AuthDto> {
    const accessToken = await this.generateToken(user.id, user.username);

    return {
      id: user.id,
      username: user.username,
      accessToken,
    };
  }

  /**
   * Validate a user who is trying to sign in
   * @param username - The username of the user
   * @param password - The password of the user
   * @returns The user info and access
   */
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
   * Sign in a user using Google OAuth and create a new user if they don't exist
   * @param request - The request object
   * @returns The user info and access token
   */
  async googleSignIn(request): Promise<any> {
    if (!request.user) {
      return null;
    }

    const { email: username } = request.user;
    let user = await this.userService.findOne(username);

    if (!user) {
      user = await this.userService.createUserOauth(request.user);
    }

    return this.signIn(user);
  }

  /**
   * Send a reset password email
   * @param email The email to send the reset password email to
   * @returns Whether the email was sent successfully
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const resetToken = await this.generateToken(user.id, user.username, '1h');

    user.resetPasswordToken = await this.passwordService.encode(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await this.userService.saveUser(user);

    const resetUrl = `http://yourfrontend.com/reset-password?token=${resetToken}`;

    await this.emailService.sendEmail(
      process.env.RESEND_EMAIL,
      email,
      'Reset Password',
      'Click here to reset your password: ' + resetUrl,
    );
  }

  async resetPassword(username: string, newPassword: string): Promise<void> {
    const user = await this.userService.findOne(username);

    //! check for access token same as the one in db

    user.password = await this.passwordService.encode(newPassword);
    await this.userService.saveUser(user);
  }

  /**
   * Generate a jwt token
   * @param id - The user id
   * @param username - The username of the user
   * @returns generated token
   */
  private async generateToken(
    id: number,
    username: string,
    expireIn?: string,
  ): Promise<string> {
    const payload = { sub: id, username: username };
    const options = { expiresIn: expireIn || '1d' };
    return await this.jwtService.signAsync(payload, options);
  }
}
