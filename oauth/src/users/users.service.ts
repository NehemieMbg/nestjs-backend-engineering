import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async createUser(body: CreateUserDto): Promise<User | null> {
    const existingUser = await this.userRepository.findOne({
      where: { username: body.username },
    });

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
}
