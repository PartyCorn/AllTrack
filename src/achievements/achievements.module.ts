import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { NotificationEventsService } from '../notification-events.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AchievementsController],
  providers: [AchievementsService, NotificationEventsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
