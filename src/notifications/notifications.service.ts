import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaginationOptions,
  createPaginatedResult,
  PaginationOptions,
} from '../common/pagination';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(
    userId: number,
    unreadOnly: boolean = false,
    options: PaginationOptions = {},
  ) {
    const { skip, take, page, limit } = createPaginationOptions(options);

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return createPaginatedResult(notifications, total, page, limit);
  }

  async markNotificationsAsRead(userId: number, ids: number[]) {
    return this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId, // Ensure user can only mark their own notifications
      },
      data: { isRead: true },
    });
  }
}
