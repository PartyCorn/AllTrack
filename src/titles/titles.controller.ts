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
import { PaginatedTitlesResponseDto } from './dto/paginated-titles-response.dto'

@ApiTags('Тайтлы')
@Controller('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить все тайтлы пользователя по ID' })
  @ApiParam({ name: 'userId', example: 1, description: 'ID пользователя' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, example: 50, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'type', required: false, enum: ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'BOOK'], description: 'Тип тайтла' })
  @ApiQuery({ name: 'excludeFranchiseTitles', required: false, type: Boolean, example: true, description: 'Исключить тайтлы из франшиз' })
  @ApiResponse({ status: 200, type: PaginatedTitlesResponseDto, description: 'Список тайтлов с пагинацией' })
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
  @ApiOperation({ summary: 'Создать тайтл для текущего пользователя' })
  @ApiBody({ type: CreateUpdateTitleDto, description: 'Данные для создания тайтла' })
  @ApiResponse({ status: 201, type: TitleDto, description: 'Созданный тайтл' })
  addTitle(@Req() req: any, @Body() dto: CreateUpdateTitleDto) {
    return this.titlesService.createTitle(req.user.userId, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить тайтл' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiBody({ type: CreateUpdateTitleDto, description: 'Данные для обновления тайтла' })
  @ApiResponse({ status: 200, type: TitleDto, description: 'Обновленный тайтл' })
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
  @ApiOperation({ summary: 'Удалить тайтл' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiResponse({ status: 200, description: 'Тайтл удален' })
  deleteTitle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.titlesService.deleteTitle(req.user.userId, id)
  }
}