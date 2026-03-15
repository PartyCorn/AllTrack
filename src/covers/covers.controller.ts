import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoversService } from './covers.service';import { CoverSearchResultDto } from './dto/cover-search-result.dto'
@ApiTags('Обложки')
@Controller('covers')
export class CoversController {
  constructor(private coversService: CoversService) {}

  @Get('search')
  @ApiOperation({ summary: 'Поиск обложек по названию' })
  @ApiResponse({ status: 200, type: CoverSearchResultDto, description: 'Список URL обложек' })
  async searchCovers(@Query('title') title: string, @Query('type') type?: string) {
    return this.coversService.searchCovers(title, type);
  }
}