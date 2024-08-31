import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { GoogleAuthDto } from '../auth/dto/google-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Creates a new user.
   * @param body - The user data.
   * @returns A promise that resolves to the created user, or null if the user already exists.
   */
  async createUser(body: CreateUserDto): Promise<User | null> {
    const existingUser: User | null = await this.findOne(body.username);

    if (existingUser) {
      return null;
    }

    const user: User = await this.userRepository.create(
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
   * Creates a new user using OAuth.
   * @param body - The user data from the OAuth provider.
   * @returns A promise that resolves to the created user, or null if the user already exists.
   */
  async createUserOauth(body: GoogleAuthDto): Promise<User | null> {
    const existingUser: User | null = await this.findOne(body.email);

    if (existingUser) {
      return null;
    }

    const user: User = await this.userRepository.create(
      new User(body.firstName, body.lastName, body.email),
    );

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Finds a user by their username.
   * @param username - The username of the user to find.
   * @returns A promise that resolves to the user object if found, or null if not found.
   */
  async findOne(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * Saves the given user to the database.
   * @param user - The user object to be saved.
   * @returns A promise that resolves to the updated user.
   */
  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
