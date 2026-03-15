import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ description: 'ID уведомления', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Тип уведомления', example: 'achievement_unlocked' })
  type: string;

  @ApiProperty({ description: 'Заголовок уведомления', example: 'Новое достижение!' })
  title: string;

  @ApiProperty({ description: 'Сообщение уведомления', example: 'Вы разблокировали достижение "Первый тайтл"' })
  message: string;

  @ApiProperty({ description: 'Дополнительные данные', nullable: true, type: Object })
  data?: any;

  @ApiProperty({ description: 'Прочитано ли уведомление', example: false })
  isRead: boolean;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;
}