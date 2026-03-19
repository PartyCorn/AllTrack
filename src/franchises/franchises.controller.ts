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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard';
import { FranchisesService } from './franchises.service';
import { CreateUpdateFranchiseDto } from './dto/create-update-franchise.dto';
import { FranchiseDto } from './dto/franchise.dto';
import { PaginatedFranchisesResponseDto } from './dto/paginated-franchises-response.dto';
import { FranchiseWithTitlesDto } from './dto/franchise-with-titles.dto';

@ApiTags('Франшизы')
@Controller('franchises')
export class FranchisesController {
  constructor(private franchisesService: FranchisesService) {}

  @Get('/user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить все франшизы пользователя' })
  @ApiParam({ name: 'userId', example: 1, description: 'ID пользователя' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Количество элементов на странице',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name'],
    description: 'Сортировка по полю',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedFranchisesResponseDto,
    description: 'Список франшиз с пагинацией',
  })
  getUserFranchises(
    @Param('userId') userId: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };
    return this.franchisesService.getUserFranchises(Number(userId), options);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить франшизу по ID с тайтлами' })
  @ApiParam({ name: 'id', example: 1, description: 'ID франшизы' })
  @ApiResponse({
    status: 200,
    type: FranchiseWithTitlesDto,
    description: 'Франшиза с тайтлами',
  })
  getFranchiseById(@Param('id', ParseIntPipe) id: number) {
    return this.franchisesService.getFranchiseById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать франшизу' })
  @ApiBody({
    type: CreateUpdateFranchiseDto,
    description: 'Данные для создания франшизы',
  })
  @ApiResponse({
    status: 201,
    type: FranchiseDto,
    description: 'Созданная франшиза',
  })
  createFranchise(@Req() req: any, @Body() dto: CreateUpdateFranchiseDto) {
    return this.franchisesService.createFranchise(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить франшизу' })
  @ApiParam({ name: 'id', example: 1, description: 'ID франшизы' })
  @ApiBody({
    type: CreateUpdateFranchiseDto,
    description: 'Данные для обновления франшизы',
  })
  @ApiResponse({
    status: 200,
    type: FranchiseDto,
    description: 'Обновленная франшиза',
  })
  updateFranchise(
    @Req() req: any,
    @Param('id') id: number,
    @Body() dto: CreateUpdateFranchiseDto,
  ) {
    return this.franchisesService.updateFranchise(
      req.user.userId,
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить франшизу' })
  @ApiParam({ name: 'id', example: 1, description: 'ID франшизы' })
  @ApiResponse({ status: 200, description: 'Франшиза удалена' })
  deleteFranchise(@Req() req: any, @Param('id') id: number) {
    return this.franchisesService.deleteFranchise(req.user.userId, Number(id));
  }

  @Post(':franchiseId/titles/:titleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Прикрепить тайтл к франшизе' })
  @ApiParam({ name: 'franchiseId', example: 1, description: 'ID франшизы' })
  @ApiParam({ name: 'titleId', example: 5, description: 'ID тайтла' })
  @ApiResponse({ status: 200, description: 'Тайтл прикреплен' })
  attachTitle(
    @Req() req: any,
    @Param('franchiseId') franchiseId: number,
    @Param('titleId') titleId: number,
  ) {
    return this.franchisesService.attachTitle(
      req.user.userId,
      Number(franchiseId),
      Number(titleId),
    );
  }

  @Delete(':franchiseId/titles/:titleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Открепить тайтл от франшизы' })
  @ApiParam({ name: 'franchiseId', example: 1, description: 'ID франшизы' })
  @ApiParam({ name: 'titleId', example: 1, description: 'ID тайтла' })
  @ApiResponse({ status: 200, description: 'Тайтл откреплен' })
  detachTitle(
    @Req() req: any,
    @Param('franchiseId') franchiseId: number,
    @Param('titleId') titleId: number,
  ) {
    return this.franchisesService.detachTitle(
      req.user.userId,
      Number(franchiseId),
      Number(titleId),
    );
  }
}
