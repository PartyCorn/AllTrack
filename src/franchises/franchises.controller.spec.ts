import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FranchisesController } from './franchises.controller';
import { FranchisesService } from './franchises.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FranchiseController', () => {
  let controller: FranchisesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FranchisesService, PrismaService, ConfigService],
      controllers: [FranchisesController],
    }).compile();

    controller = module.get<FranchisesController>(FranchisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
