import { ApiProperty } from '@nestjs/swagger'

export class FranchiseDto {
  @ApiProperty({ example: 1, description: 'ID франшизы' })
  id: number

  @ApiProperty({ example: 'Naruto', description: 'Название франшизы' })
  name: string

  @ApiProperty({ example: 'Shonen ninja universe', description: 'Описание франшизы' })
  description?: string

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  userId: number

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date

  @ApiProperty({ example: 60, description: 'Процент прогресса по франшизе' })
  progressPercent: number

  @ApiProperty({ description: 'Статистика', type: Object })
  stats: {
    titlesCount: { [key: string]: number };
    statusCount: { [key: string]: number };
  };
}