import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationEventsService } from '../notification-events.service';

@Module({
  imports: [PrismaModule],
  controllers: [FriendsController],
  providers: [FriendsService, NotificationEventsService],
  exports: [FriendsService],
})
export class FriendsModule {}
