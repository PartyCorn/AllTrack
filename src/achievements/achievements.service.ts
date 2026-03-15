import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getUserAchievements(userId: number) {
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
    return achievements.map(a => ({
      title: a.achievement.title,
      description: a.achievement.description,
      xpReward: a.achievement.xpReward,
      unlockedAt: a.unlockedAt,
    }));
  }
}