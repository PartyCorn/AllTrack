import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TitlesService } from './titles/titles.service';
import { TitlesController } from './titles/titles.controller';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsController } from './achievements/achievements.controller';
import { GamificationService } from './gamification/gamification.service';
import { FranchisesService } from './franchises/franchises.service';
import { FranchisesController } from './franchises/franchises.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UsersModule],
  controllers: [AppController, TitlesController, AchievementsController, FranchisesController],
  providers: [AppService, TitlesService, AchievementsService, GamificationService, FranchisesService],
})
export class AppModule {}