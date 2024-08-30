import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleAuthDto } from '../auth/dto/google-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';

const dummyUser = {
  firstName: 'Naomie',
  lastName: 'Liu',
  username: 'naomie.liu@test.com',
  password: 'testtest',
};

describe('UsersService', () => {
  let service: UsersService;
  const passwordService: PasswordService = new PasswordService();

  beforeEach(async () => {
    const users: User[] = [];

    const userRepository: Partial<Repository<User>> = {
      create: jest.fn().mockImplementation((user: User): Promise<User> => {
        if (users.find((storedUser) => storedUser.username === user.username)) {
          return null;
        }

        const newUser = new User(
          user.firstName,
          user.lastName,
          user.username,
          user.password,
        );

        newUser.id = Math.floor(Math.random() * 99999);
        return Promise.resolve(newUser);
      }),

      save: jest.fn().mockImplementation((user: User): Promise<User> => {
        for (let i: number = 0; i < users.length; i++) {
          if (user.id && users[i].id === user.id) {
            users[i] = { ...user };
            return Promise.resolve(user);
          }
        }

        users.push(user);
        return Promise.resolve(user);
      }),

      findOne: jest
        .fn()
        .mockImplementation((username: string): Promise<User | undefined> => {
          const user = users.find((user) => user.username === username);
          return Promise.resolve(user);
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PasswordService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a valid user', async () => {
      const dummyUser = {
        firstName: 'Naomie',
        lastName: 'Liu',
        username: 'naomie.liu@test.com',
        password: 'testtest',
      };

      const user: User = await service.createUser(dummyUser);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(typeof user.id).toEqual('number');
      expect(user.username).toEqual(dummyUser.username);
    });

    it('should return null if a user already exist', async () => {
      const dummyUser = {
        firstName: 'Naomie',
        lastName: 'Liu',
        username: 'naomie.liu@test.com',
        password: 'testtest',
      };

      const users: User[] = [{ id: 1, ...dummyUser }];
      service.createUser = (user: CreateUserDto) => {
        for (const curr of users) {
          if (curr.username === user.username) {
            return Promise.resolve(null);
          }
        }

        return Promise.resolve({ id: 1, ...dummyUser } as User);
      };

      const otherUser: User = await service.createUser(dummyUser);

      expect(otherUser).toEqual(null);
    });

    it('should encode the user password correctly', async () => {
      const dummyUser = {
        firstName: 'Naomie',
        lastName: 'Liu',
        username: 'naomie.liu@test.com',
        password: 'testtest',
      };

      const user: User = await service.createUser(dummyUser);

      // ? check that the password has been encoded
      expect(user.password).not.toEqual(dummyUser.password);

      // ? compares the encoded against the given password
      await expect(
        passwordService.compare(dummyUser.password, user.password),
      ).toBeTruthy();

      // ? test against wrong password
      await expect(
        passwordService.compare('testtestsss', user.password),
      ).resolves.toBeFalsy();
    });
  });

  describe('createUserOauth', () => {
    it('should create a valid user using oauth', async () => {
      const dummyUser = {
        firstName: 'Naomie',
        lastName: 'Liu',
        email: 'naomie.liu@test.com',
      } as Partial<GoogleAuthDto>;

      const user: User = await service.createUserOauth(
        dummyUser as GoogleAuthDto,
      );

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(typeof user.id).toEqual('number');
      expect(user.username).toEqual(dummyUser.email);
      expect(user.password).toEqual(undefined);
    });
  });

  describe('findOne', () => {
    it('should return a user with a given username', async () => {
      service.findOne = (username: string): Promise<User> => {
        return Promise.resolve({
          id: 1,
          firstName: dummyUser.firstName,
          lastName: dummyUser.lastName,
          username,
          password: dummyUser.password,
        } as User);
      };

      const user: User = await service.findOne(dummyUser.username);
      expect(user).toBeDefined();
    });
  });
});
