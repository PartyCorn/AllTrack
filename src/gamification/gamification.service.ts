import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Добавляет XP пользователю и повышает уровень при достижении порога
   * @param userId ID пользователя
   * @param amount количество XP
   */
  async addXp(userId: number, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    let newXp = user.xp + amount;
    let newLevel = user.level;

    // Простой пример: каждые 100 XP = уровень выше
    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });
  }
}
