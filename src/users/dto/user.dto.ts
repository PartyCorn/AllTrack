// src/users/dto/safe-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Email (виден только владельцу)',
    nullable: true,
    example: 'user@example.com',
  })
  email: string | null;

  @ApiProperty({ description: 'Никнейм', example: 'andreyy' })
  nickname: string;

  @ApiProperty({ description: 'Биография', nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Ссылка на аватар', nullable: true })
  avatarUrl?: string;

  @ApiProperty({ description: 'Уровень', example: 1 })
  level: number;

  @ApiProperty({ description: 'XP', example: 0 })
  xp: number;

  @ApiProperty({ description: 'Приватный ли профиль', example: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Дата создания аккаунта' })
  createdAt: Date;

  @ApiProperty({ description: 'Достижения (первые 10)', type: [Object] })
  achievements: any[];

  @ApiProperty({ description: 'Статистика', type: Object })
  stats: {
    titlesCount: { [key: string]: number };
    statusCount: { [key: string]: number };
  };

  @ApiProperty({ description: 'Это ваш профиль', example: true })
  isMyProfile: boolean;

  @ApiProperty({
    description: 'Статус дружбы',
    enum: ['friends', 'not_friends', 'pending_outgoing', 'pending_incoming'],
    example: 'friends',
  })
  friendStatus:
    | 'friends'
    | 'not_friends'
    | 'pending_outgoing'
    | 'pending_incoming';
}
