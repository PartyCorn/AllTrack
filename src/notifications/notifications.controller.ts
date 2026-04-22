import { Controller, Get, Put, Query, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { NotificationsService } from './notifications.service';
import { NotificationEventsService } from '../notification-events.service';
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto';
import { Observable, map } from 'rxjs';
import { Sse } from '@nestjs/common';

@ApiTags('Уведомления')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationEvents: NotificationEventsService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить уведомления текущего пользователя' })
  @ApiQuery({ name: 'unread', type: Boolean, required: false, description: 'Показать только непрочитанные' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Количество элементов на странице' })
  @ApiResponse({ status: 200, type: PaginatedNotificationsResponseDto, description: 'Пагинированные уведомления' })
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
  @ApiOperation({ summary: 'Отметить уведомления как прочитанные' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' }, description: 'Массив ID уведомлений' } } }, description: 'ID уведомлений для отметки как прочитанные' })
  @ApiResponse({ status: 200, description: 'Уведомления отмечены как прочитанные' })
  markNotificationsAsRead(@Body() body: { ids: number[] }, @Req() req: any) {
    const requesterId = req.user.userId;
    return this.notificationsService.markNotificationsAsRead(requesterId, body.ids);
  }

  @Put('me/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  @ApiResponse({ status: 200, description: 'Все уведомления отмечены как прочитанные' })
  markAllNotificationsAsRead(@Req() req: any) {
    const requesterId = req.user.userId;
    return this.notificationsService.markAllNotificationsAsRead(requesterId);
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