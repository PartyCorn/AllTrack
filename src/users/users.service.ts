// src/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TitleDto } from '../titles/dto/title.dto';
import { AchievementDto } from '../achievements/dto/achievement.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        titles: {
          include: { franchise: true },
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.mapSafeUser(user, userId);
  }

  async getPublicProfile(nickname: string, requesterId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { nickname },
      include: {
        titles: {
          include: { franchise: true },
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.isPrivate && user.id !== requesterId) {
      throw new ForbiddenException('Profile is private');
    }

    return this.mapSafeUser(user, requesterId);
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: {
        titles: {
          include: { franchise: true },
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    return this.mapSafeUser(user, userId);
  }

  mapSafeUser(user: any, requesterId?: number) {
    const titles: TitleDto[] = (user.titles || []).map((t) => ({
      id: t.id,
      type: t.type,
      title: t.title,
      description: t.description,
      coverUrl: t.coverUrl,
      externalUrl: t.externalUrl,
      totalUnits: t.totalUnits,
      currentUnit: t.currentUnit,
      status: t.status,
      rating: t.rating,
      note: t.note,
      franchise: t.franchise ? { id: t.franchise.id, name: t.franchise.name } : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const achievements: AchievementDto[] = (user.achievements || []).map((ua) => ({
      id: ua.id,
      achievementId: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      xpReward: ua.achievement.xpReward,
      unlockedAt: ua.unlockedAt.getTime(),
    }));

    return {
      id: user.id,
      email: requesterId === user.id ? user.email : null,
      nickname: user.nickname,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt.getTime(),
      titles,
      achievements,
      isMyProfile: requesterId === user.id,
    };
  }
}