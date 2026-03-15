import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementConditionFactory } from './conditions/achievement-condition.factory';
import { NotificationEventsService } from '../notification-events.service';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async getUserAchievements(userId: number) {
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
    const totalUsers = await this.prisma.user.count();

    return await Promise.all(achievements.map(async (a) => {
      const unlockCount = await this.prisma.userAchievement.count({
        where: { achievementId: a.achievement.id },
      });
      const rarity = totalUsers > 0 ? unlockCount / totalUsers : 0;
      return {
        id: a.id,
        achievementId: a.achievement.id,
        title: a.achievement.title,
        description: a.achievement.description,
        icon: a.achievement.icon,
        xpReward: a.achievement.xpReward,
        unlockedAt: a.unlockedAt,
        rarity,
      };
    }));
  }

  async getAllAchievements(userId?: number, filter?: string) {
    const achievements = await this.prisma.achievement.findMany();
    const totalUsers = await this.prisma.user.count();

    let userAchievements: any[] = [];
    if (userId) {
      userAchievements = await this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      });
    }
    const userAchievementMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithDetails = await Promise.all(
      achievements.map(async (achievement) => {
        const unlockCount = await this.prisma.userAchievement.count({
          where: { achievementId: achievement.id },
        });
        const rarity = totalUsers > 0 ? unlockCount / totalUsers : 0;
        const unlockedAt = userAchievementMap.get(achievement.id) || null;
        const unlocked = !!unlockedAt;
        return {
          ...achievement,
          rarity,
          unlocked,
          unlockedAt,
        };
      })
    );

    if (filter === 'unlocked') {
      return achievementsWithDetails.filter(a => a.unlocked);
    } else if (filter === 'locked') {
      return achievementsWithDetails.filter(a => !a.unlocked);
    }
    return achievementsWithDetails;
  }

  async checkAndAwardAchievements(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        titles: true,
        achievements: { include: { achievement: true } },
      },
    });

    if (!user) return;

    const existingAchievementIds = user.achievements.map(ua => ua.achievementId);
    const allAchievements = await this.prisma.achievement.findMany();

    const newAchievements: any[] = [];

    for (const achievement of allAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;

      const condition = AchievementConditionFactory.getCondition(achievement.code);
      if (!condition) continue;

      if (condition.check(user)) {
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // Award XP
        await this.addXp(userId, achievement.xpReward);

        // Create notification asynchronously
        setImmediate(() => {
          this.createNotification(userId, 'achievement_unlocked', `Achievement Unlocked: ${achievement.title}`, `You have unlocked the "${achievement.title}" achievement!`, { achievementId: achievement.id });
        });

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  private async addXp(userId: number, xp: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xp,
        },
      },
    });
  }

  private async createNotification(userId: number, type: string, title: string, message: string, data?: any) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });

    // Emit event for real-time updates
    this.notificationEvents.emitNewNotification(userId, notification);

    return notification;
  }
}