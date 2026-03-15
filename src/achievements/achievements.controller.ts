import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { UsersService } from '../users/users.service';
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    private usersService: UsersService,
  ) {}

  // User achievements
  @Get('users/:nickname')
  @ApiOperation({ summary: 'Get all achievements of a user by nickname' })
  @ApiParam({ name: 'nickname', description: 'User nickname', example: 'andreyy' })
  @ApiResponse({ status: 200, description: 'Array of achievements' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserAchievements(@Param('nickname') nickname: string) {
    const user = await this.usersService.getPublicProfile(nickname);
    return this.achievementsService.getUserAchievements(user.id);
  }

  // List all achievements
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all achievements' })
  @ApiQuery({ name: 'filter', enum: ['unlocked', 'locked', 'all'], required: false })
  @ApiResponse({ status: 200, description: 'Array of achievements' })
  getAllAchievements(@Query('filter') filter: string, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.achievementsService.getAllAchievements(userId, filter);
  }
}