import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class NotificationCleanupService {
  private readonly logger = new Logger(NotificationCleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: oneMonthAgo,
        },
      },
    });

    this.logger.log(`Deleted ${result.count} old notifications`);
  }
}