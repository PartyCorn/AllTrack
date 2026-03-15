// src/users/dto/safe-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Email visible only to owner', nullable: true, example: 'user@example.com' })
  email: string | null;

  @ApiProperty({ description: 'Nickname', example: 'andreyy' })
  nickname: string;

  @ApiProperty({ description: 'Bio', nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  avatarUrl?: string;

  @ApiProperty({ description: 'Level', example: 1 })
  level: number;

  @ApiProperty({ description: 'XP', example: 0 })
  xp: number;

  @ApiProperty({ description: 'Is profile private', example: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Achievements (first 10)', type: [Object] })
  achievements: any[];

  @ApiProperty({ description: 'Statistics', type: Object })
  stats: {
    titlesCount: { [key: string]: number };
    statusCount: { [key: string]: number };
  };

  @ApiProperty({ description: 'Is this your own profile', example: true })
  isMyProfile: boolean;
}