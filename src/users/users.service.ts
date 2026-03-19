// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TitleDto } from '../titles/dto/title.dto';
import { UserAchievementDto } from '../achievements/dto/user-achievement.dto';

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
        sentFriendRequests: true,
        receivedFriendRequests: true,
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
        sentFriendRequests: true,
        receivedFriendRequests: true,
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
        sentFriendRequests: true,
        receivedFriendRequests: true,
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
      franchise: t.franchise
        ? { id: t.franchise.id, name: t.franchise.name }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const achievements: UserAchievementDto[] = (user.achievements || [])
      .map((ua) => ({
        id: ua.id,
        achievementId: ua.achievement.id,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      }))
      .slice(0, 10); // Limit to first 10

    // Calculate stats
    const titlesCount = titles.reduce(
      (acc, title) => {
        acc[title.type] = (acc[title.type] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const statusCount = titles.reduce(
      (acc, title) => {
        acc[title.status] = (acc[title.status] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    // Calculate friend status
    let friendStatus:
      | 'friends'
      | 'not_friends'
      | 'pending_outgoing'
      | 'pending_incoming' = 'not_friends';
    if (requesterId && requesterId !== user.id) {
      // Check friendship status
      const friendship =
        user.sentFriendRequests?.find(
          (f: any) => f.addresseeId === requesterId,
        ) ||
        user.receivedFriendRequests?.find(
          (f: any) => f.requesterId === requesterId,
        );
      if (friendship) {
        if (friendship.status === 'ACCEPTED') {
          friendStatus = 'friends';
        } else if (friendship.status === 'PENDING') {
          if (friendship.requesterId === requesterId) {
            friendStatus = 'pending_outgoing';
          } else {
            friendStatus = 'pending_incoming';
          }
        }
      }
    }

    return {
      id: user.id,
      email: requesterId === user.id ? user.email : null,
      nickname: user.nickname,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      achievements,
      stats: {
        titlesCount,
        statusCount,
      },
      isMyProfile: requesterId === user.id,
      friendStatus,
    };
  }

  async exportUserData(userId: number, format: string, requesterId?: number) {
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

    if (user.isPrivate && user.id !== requesterId) {
      throw new ForbiddenException('Profile is private');
    }

    const data = {
      user: {
        id: user.id,
        nickname: user.nickname,
        bio: user.bio,
        level: user.level,
        xp: user.xp,
        createdAt: user.createdAt,
      },
      titles: user.titles,
      achievements: user.achievements,
    };

    if (format === 'csv') {
      // Simple CSV for titles
      const csv =
        'id,type,title,status,rating\n' +
        user.titles
          .map(
            (t) => `${t.id},${t.type},${t.title},${t.status},${t.rating || ''}`,
          )
          .join('\n');
      return csv;
    }

    return data;
  }
}
