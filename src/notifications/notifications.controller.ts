import { Controller, Get, Put, Query, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { NotificationsService } from './notifications.service';
import { NotificationEventsService } from '../notification-events.service';
import { Observable, map } from 'rxjs';
import { Sse } from '@nestjs/common';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationEvents: NotificationEventsService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'unread', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Paginated notifications' })
  getUserNotifications(
    @Query('unread') unread: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: any
  ) {
    const requesterId = req.user.userId;
    const unreadOnly = unread === 'true';
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.notificationsService.getUserNotifications(requesterId, unreadOnly, options);
  }

  @Put('me/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  markNotificationsAsRead(@Body() body: { ids: number[] }, @Req() req: any) {
    const requesterId = req.user.userId;
    return this.notificationsService.markNotificationsAsRead(requesterId, body.ids);
  }

  @Sse('me/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream real-time notifications' })
  streamNotifications(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.userId;
    return new Observable((subscriber) => {
      const listener = (notification: any) => {
        subscriber.next({ data: notification } as MessageEvent);
      };

      this.notificationEvents.getEmitter().on(`notification:${userId}`, listener);

      // Cleanup on unsubscribe
      return () => {
        this.notificationEvents.getEmitter().off(`notification:${userId}`, listener);
      };
    }).pipe(
      map((event) => event as MessageEvent),
    );
  }
}