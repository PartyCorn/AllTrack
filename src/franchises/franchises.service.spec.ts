import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FranchisesService } from './franchises.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FranchiseService', () => {
  let service: FranchisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FranchisesService, ConfigService, PrismaService],
    }).compile();

    service = module.get<FranchisesService>(FranchisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
