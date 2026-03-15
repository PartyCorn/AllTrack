import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationEventsService } from '../notification-events.service';

@Module({
  providers: [UsersService, NotificationEventsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
