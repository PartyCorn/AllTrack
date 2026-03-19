import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { NotificationEventsService } from '../notification-events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AchievementsService', () => {
  let service: AchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        PrismaService,
        NotificationEventsService,
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
