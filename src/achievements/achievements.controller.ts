import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { UsersService } from '../users/users.service';

@ApiTags('Achievements')
@Controller('users')
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    private usersService: UsersService,
  ) {}

  @Get(':nickname/achievements')
  @ApiOperation({ summary: 'Get all achievements of a user by nickname' })
  @ApiParam({ name: 'nickname', description: 'User nickname', example: 'andreyy' })
  @ApiResponse({ status: 200, description: 'Array of achievements' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserAchievements(@Param('nickname') nickname: string) {
    const user = await this.usersService.getPublicProfile(nickname);
    return this.achievementsService.getUserAchievements(user.id);
  }
}