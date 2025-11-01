import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersModule', () => {
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockRepository)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UsersService', () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
  });

  it('should export UsersService', () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeInstanceOf(UsersService);
  });

  it('should have User repository', () => {
    const repository = module.get(getRepositoryToken(User));
    expect(repository).toBeDefined();
  });

  afterAll(async () => {
    await module.close();
  });
});