import { Test, TestingModule } from '@nestjs/testing';
import { KinopoiskController } from './kinopoisk.controller';
import { KinopoiskService } from './kinopoisk.service';

describe('KinopoiskController', () => {
  let controller: KinopoiskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KinopoiskController],
      providers: [KinopoiskService],
    }).compile();

    controller = module.get<KinopoiskController>(KinopoiskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
