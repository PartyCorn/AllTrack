import { ApiProperty } from '@nestjs/swagger';
import { FranchiseDto } from '../../franchises/dto/franchise.dto';

export class PaginatedFranchisesResponseDto {
  @ApiProperty({ type: [FranchiseDto], description: 'Массив франшиз' })
  items: FranchiseDto[];

  @ApiProperty({ description: 'Общее количество элементов', example: 100 })
  total: number;

  @ApiProperty({ description: 'Текущая страница', example: 1 })
  page: number;

  @ApiProperty({ description: 'Количество элементов на странице', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Общее количество страниц', example: 2 })
  totalPages: number;
}
