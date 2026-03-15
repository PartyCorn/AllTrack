import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { UsersService } from '../users/users.service';
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard';
import { AchievementDto } from './dto/achievement.dto'
import { UserAchievementDto } from './dto/user-achievement.dto'

@ApiTags('Достижения')
@Controller('achievements')
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    private usersService: UsersService,
  ) {}

  // User achievements
  @Get('users/:nickname')
  @ApiOperation({ summary: 'Получить все достижения пользователя по никнейму' })
  @ApiParam({ name: 'nickname', description: 'Никнейм пользователя', example: 'andreyy' })
  @ApiResponse({ status: 200, type: [UserAchievementDto], description: 'Массив достижений' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserAchievements(@Param('nickname') nickname: string) {
    const user = await this.usersService.getPublicProfile(nickname);
    return this.achievementsService.getUserAchievements(user.id);
  }

  // List all achievements
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все достижения' })
  @ApiQuery({ name: 'filter', enum: ['unlocked', 'locked', 'all'], required: false, description: 'Фильтр достижений: unlocked - разблокированные, locked - заблокированные, all - все' })
  @ApiResponse({ status: 200, type: [AchievementDto], description: 'Массив достижений' })
  getAllAchievements(@Query('filter') filter: string, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.achievementsService.getAllAchievements(userId, filter);
  }
}