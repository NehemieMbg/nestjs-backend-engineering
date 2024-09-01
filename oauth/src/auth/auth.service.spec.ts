import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { PasswordService } from '../users/password.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

const generateId = (): number => Math.floor(Math.random() * 99999);

const dummyUser = {
  firstName: 'Naomie',
  lastName: 'Liu',
  username: 'naomie.liu@gmail.com',
  password: 'password',
};

const fakePasswordService: Partial<PasswordService> = {
  encode: async (password: string): Promise<string> => password,
  compare: async (password: string, hash: string): Promise<boolean> =>
    password === hash,
};

const fakeEmailService: Partial<EmailService> = {
  sendEmail: async (
    from: string,
    to: string,
    subject: string,
    text: string,
  ): Promise<void> => {
    console.log('From: ', from);
    console.log('To: ', to);
    console.log('Subject: ', subject);
    console.log('Text: ', text);
    return;
  },
};
describe('AuthService', () => {
  let users: User[];
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockEmailService: Partial<EmailService>;
  let mockPasswordService: Partial<PasswordService>;

  beforeEach(async () => {
    users = [];
    mockEmailService = fakeEmailService;
    mockPasswordService = fakePasswordService;
    mockUsersService = {
      async createUser(body: CreateUserDto): Promise<User | null> {
        const user: User = await this.findOne(body.username);

        if (user) {
          return null;
        }

        const newUser: User = new User(
          body.firstName,
          body.lastName,
          body.username,
          body.password,
        );

        newUser.id = generateId();
        users.push(newUser);
        return newUser;
      },
      async findOne(username: string): Promise<User | null> {
        return users.find((user: User) => user.username === username) || null;
      },
      async createUserOauth(body: GoogleAuthDto): Promise<User | null> {
        const user: User = await this.findOne(body.email);

        if (user) {
          return null;
        }

        const newUser: User = new User(
          body.firstName,
          body.lastName,
          body.email,
        );

        newUser.id = generateId();
        users.push(newUser);
        return newUser;
      },
      async saveUser(user: User): Promise<User> {
        const index: number = users.findIndex(
          (storedUser: User) => storedUser.id === user.id,
        );

        if (index === -1) {
          users.push(user);
          return user;
        }

        users[index] = user;
        return user;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'secret_key_test' }),
        },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const result: AuthDto = await service.signup(dummyUser);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.username).toEqual(dummyUser.username);
    });
  });

  describe('signIn', () => {});

  describe('googleSignIn', () => {});

  describe('validateUser', () => {});

  describe('generateToken', () => {});

  describe('requestPasswordReset', () => {});

  describe('resetPassword', () => {});
});
