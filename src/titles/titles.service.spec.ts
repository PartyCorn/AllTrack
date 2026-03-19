import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TitlesService } from './titles.service';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationEventsService } from '../notification-events.service';

describe('TitlesService', () => {
  let service: TitlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TitlesService,
        PrismaService,
        ConfigService,
        AchievementsService,
        GamificationService,
        NotificationEventsService,
      ],
    }).compile();

    service = module.get<TitlesService>(TitlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTitleData', () => {
    it('should throw error if currentUnit is negative', () => {
      expect(() => {
        (service as any).validateTitleData(10, -1, 5, 'note');
      }).toThrow(BadRequestException);
    });

    it('should throw error if currentUnit exceeds totalUnits', () => {
      expect(() => {
        (service as any).validateTitleData(10, 15, 5, 'note');
      }).toThrow(BadRequestException);
    });

    it('should not throw for valid data', () => {
      expect(() => {
        (service as any).validateTitleData(10, 5, 5, 'note');
      }).not.toThrow();
    });
  });
});
