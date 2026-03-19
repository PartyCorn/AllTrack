import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ description: 'ID комментария' })
  id: number;

  @ApiProperty({ description: 'ID автора' })
  authorId: number;

  @ApiProperty({ description: 'ID профиля' })
  profileId: number;

  @ApiProperty({ description: 'Содержимое комментария' })
  content: string;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;

  @ApiProperty({ description: 'Информация об авторе', type: Object })
  author: {
    id: number;
    nickname: string;
    avatarUrl?: string;
  };
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({ description: 'Список комментариев', type: [CommentDto] })
  items: CommentDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Количество на странице' })
  limit: number;

  @ApiProperty({ description: 'Общее количество страниц' })
  totalPages: number;
}
