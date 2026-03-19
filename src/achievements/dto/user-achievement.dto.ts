import { ApiProperty } from '@nestjs/swagger';

export class UserAchievementDto {
  @ApiProperty({ description: 'ID юзер-достижения', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID достижения', example: 1 })
  achievementId: number;

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

  @ApiProperty({
    description: 'Дата открытия достижения',
    example: 1678000000000,
  })
  unlockedAt: number;
}
