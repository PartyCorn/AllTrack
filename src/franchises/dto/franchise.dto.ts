import { ApiProperty } from '@nestjs/swagger'

export class FranchiseDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'Naruto' })
  name: string

  @ApiProperty({ example: 'Shonen ninja universe' })
  description?: string

  @ApiProperty({ example: 1 })
  userId: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ example: 60 })
  progressPercent: number

  @ApiProperty({ description: 'Statistics', type: Object })
  stats: {
    titlesCount: { [key: string]: number };
    statusCount: { [key: string]: number };
  };
}