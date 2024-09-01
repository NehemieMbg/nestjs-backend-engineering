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
import { BadRequestException } from '@nestjs/common';

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
      const user: AuthDto = await service.signup(dummyUser);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toEqual(dummyUser.username);
    });

    it('should throw an exception if a user already exist', async () => {
      await service.signup(dummyUser);

      await expect(service.signup(dummyUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('should return a valid auth object', async () => {
      const user: User = new User(
        dummyUser.firstName,
        dummyUser.lastName,
        dummyUser.username,
        dummyUser.password,
      );
      user.id = 1;

      const userSignedIn: AuthDto = await service.signIn(user);

      expect(userSignedIn.id).toBeDefined();
      expect(userSignedIn.accessToken).toBeDefined();
      expect(userSignedIn.username).toEqual(user.username);
    });
  });

  describe('googleSignIn', () => {
    it('should return null if user is not provided in the request object', async () => {
      await expect(service.googleSignIn({})).resolves.toBeNull();
    });

    it('should return a valid auth object using oauth with an existing user', async () => {
      const existingUser: User = { id: 1, ...dummyUser, password: null };
      users.push(existingUser);

      const request = {
        user: {
          email: existingUser.username,
        },
      };

      const authenticatedUser = await service.googleSignIn(request);

      expect(authenticatedUser.id).toBeDefined();
      expect(authenticatedUser.accessToken).toBeDefined();
      expect(authenticatedUser.username).toEqual(existingUser.username);
    });

    it('should return a valid auth object using oauth with no existing user', async () => {
      const newUser: Partial<GoogleAuthDto> = {
        firstName: dummyUser.firstName,
        lastName: dummyUser.lastName,
        email: dummyUser.username,
      };

      const authenticatedUser = await service.googleSignIn({ user: newUser });

      expect(authenticatedUser.id).toBeDefined();
      expect(authenticatedUser.accessToken).toBeDefined();
      expect(authenticatedUser.username).toEqual(newUser.email);
    });
  });

  describe('validateUser', () => {
    it('should return a valid user object using the correct credentials', async () => {
      users.push({ id: generateId(), ...dummyUser });
      const user: User | null = await service.validateUser(
        dummyUser.username,
        dummyUser.password,
      );

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toEqual(dummyUser.username);
    });

    it('should return null if wrong password is provided', async () => {
      users.push({ id: generateId(), ...dummyUser });
      const user: User | null = await service.validateUser(
        dummyUser.username,
        'wrongpassword',
      );

      expect(user).toBeNull();
    });
  });

  describe('requestPasswordReset', () => {
    it('should accept the reset request', async () => {
      users.push({ id: generateId(), ...dummyUser });
      const response: { message: string } = await service.requestPasswordReset(
        dummyUser.username,
      );

      expect(response.message).toBeDefined();
    });

    it('should throw a BadRequestException if user is not found', async () => {
      await expect(
        service.requestPasswordReset('test@test.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset the user password', async () => {});

    it('should throw if invalid token provided', async () => {});

    it('should throw if the provided token has expired', async () => {});
  });
});
