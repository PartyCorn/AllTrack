import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard'
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard'
import { TitlesService } from './titles.service'
import { CreateUpdateTitleDto } from './dto/create-update-title.dto'
import { TitleDto } from './dto/title.dto'

@ApiTags('Titles')
@Controller('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all titles for a user by ID' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'type', required: false, enum: ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'BOOK'] })
  @ApiQuery({ name: 'excludeFranchiseTitles', required: false, type: Boolean, example: true })
  @ApiResponse({ status: 200, type: Object })
  getUserTitles(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('excludeFranchiseTitles') excludeFranchiseTitles?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    const exclude = excludeFranchiseTitles === 'true';
    return this.titlesService.getUserTitles(userId, options, type, exclude);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create title for current user' })
  @ApiBody({ type: CreateUpdateTitleDto })
  @ApiResponse({ status: 201, type: TitleDto })
  addTitle(@Req() req: any, @Body() dto: CreateUpdateTitleDto) {
    return this.titlesService.createTitle(req.user.userId, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update title' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: CreateUpdateTitleDto })
  @ApiResponse({ status: 200, type: TitleDto })
  updateTitle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateUpdateTitleDto,
  ) {
    return this.titlesService.updateTitle(req.user.userId, id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete title' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200 })
  deleteTitle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.titlesService.deleteTitle(req.user.userId, id)
  }
}