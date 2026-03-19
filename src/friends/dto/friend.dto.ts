import { ApiProperty } from '@nestjs/swagger';

export class FriendDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Никнейм', example: 'andreyy' })
  nickname: string;

  @ApiProperty({ description: 'Ссылка на аватар', nullable: true })
  avatarUrl?: string;
}
