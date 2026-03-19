import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TitlesController } from './titles.controller';
import { TitlesService } from './titles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationEventsService } from '../notification-events.service';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementsService } from '../achievements/achievements.service';

describe('TitlesController', () => {
  let controller: TitlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TitlesService,
        NotificationEventsService,
        PrismaService,
        GamificationService,
        AchievementsService,
        ConfigService,
      ],
      controllers: [TitlesController],
    }).compile();

    controller = module.get<TitlesController>(TitlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
