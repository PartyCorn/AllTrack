import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TitlesService } from './titles/titles.service';
import { TitlesController } from './titles/titles.controller';
import { AchievementsModule } from './achievements/achievements.module';
import { GamificationService } from './gamification/gamification.service';
import { FranchisesService } from './franchises/franchises.service';
import { FranchisesController } from './franchises/franchises.controller';
import { KinopoiskModule } from './kinopoisk/kinopoisk.module';
import { NotificationCleanupService } from './notification-cleanup.service';
import { NotificationEventsService } from './notification-events.service';
import { NotificationsModule } from './notifications/notifications.module';
import { FriendsModule } from './friends/friends.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot(), PrismaModule, AuthModule, UsersModule, AchievementsModule, KinopoiskModule, NotificationsModule, FriendsModule, CommentsModule],
  controllers: [TitlesController, FranchisesController],
  providers: [TitlesService, GamificationService, FranchisesService, NotificationCleanupService, NotificationEventsService],
})
export class AppModule {}