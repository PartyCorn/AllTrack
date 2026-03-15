import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto } from './notification.dto';

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationDto], description: 'Массив уведомлений' })
  items: NotificationDto[];

  @ApiProperty({ description: 'Общее количество элементов', example: 100 })
  total: number;

  @ApiProperty({ description: 'Текущая страница', example: 1 })
  page: number;

  @ApiProperty({ description: 'Количество элементов на странице', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Общее количество страниц', example: 2 })
  totalPages: number;
}