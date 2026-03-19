import { ApiProperty } from '@nestjs/swagger';

export class AchievementDto {
  @ApiProperty({ description: 'ID достижения', example: 1 })
  id: number;

  @ApiProperty({ description: 'Код достижения', example: 'FIRST_TITLE' })
  code: string;

  @ApiProperty({
    description: 'Название достижения',
    example: 'First Title Added',
  })
  title: string;

  @ApiProperty({
    description: 'Описание достижения',
    example: 'Added your first title',
  })
  description: string;

  @ApiProperty({ description: 'Иконка достижения', example: '🏆' })
  icon: string;

  @ApiProperty({ description: 'XP за достижение', example: 10 })
  xpReward: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;
}
