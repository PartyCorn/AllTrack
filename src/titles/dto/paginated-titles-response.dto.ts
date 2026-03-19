import { ApiProperty } from '@nestjs/swagger';
import { TitleDto } from '../../titles/dto/title.dto';

export class PaginatedTitlesResponseDto {
  @ApiProperty({ type: [TitleDto], description: 'Массив тайтлов' })
  items: TitleDto[];

  @ApiProperty({ description: 'Общее количество элементов', example: 100 })
  total: number;

  @ApiProperty({ description: 'Текущая страница', example: 1 })
  page: number;

  @ApiProperty({ description: 'Количество элементов на странице', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Общее количество страниц', example: 2 })
  totalPages: number;
}
