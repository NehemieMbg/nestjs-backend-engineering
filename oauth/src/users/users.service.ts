import { Injectable, NotImplementedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { GoogleProfile } from '../auth/strategy/google.strategy';
import { GoogleAuthDto } from '../auth/dto/google-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Create a new user
   * @param body - The user data
   * @return The created user
   */
  async createUser(body: CreateUserDto): Promise<User | null> {
    const existingUser = await this.findOne(body.username);

    if (existingUser) {
      return null;
    }

    const user = await this.userRepository.create(
      new User(
        body.firstName,
        body.lastName,
        body.username,
        await this.passwordService.encode(body.password),
      ),
    );
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Create a new user using OAuth
   * @param body - The user data
   * @return The created user
   */
  async createUserOauth(body: GoogleAuthDto): Promise<User | null> {
    const existingUser = await this.findOne(body.email);

    if (existingUser) {
      return null;
    }

    const user = await this.userRepository.create(
      new User(body.firstName, body.lastName, body.email),
    );

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Find a user by username
   * @param username - The username
   * @return The user
   */
  async findOne(username: string) {
    return await this.userRepository.findOne({
      where: { username },
    });
  }
}
