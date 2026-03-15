import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseController } from './franchises.controller';

describe('FranchiseController', () => {
  let controller: FranchiseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FranchiseController],
    }).compile();

    controller = module.get<FranchiseController>(FranchiseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
