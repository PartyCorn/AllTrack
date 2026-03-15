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
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard'
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard'
import { FranchisesService } from './franchises.service'
import { CreateUpdateFranchiseDto } from './dto/create-update-franchise.dto'
import { FranchiseDto } from './dto/franchise.dto'

@ApiTags('Franchises')
@Controller('franchises')
export class FranchisesController {
  constructor(private franchisesService: FranchisesService) {}

  @Get('/user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all franchises for a user' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiResponse({ status: 200, type: [FranchiseDto] })
  getUserFranchises(@Param('userId') userId: number) {
    return this.franchisesService.getUserFranchises(Number(userId))
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a franchise' })
  @ApiBody({ type: CreateUpdateFranchiseDto })
  @ApiResponse({ status: 201, type: FranchiseDto })
  createFranchise(@Req() req: any, @Body() dto: CreateUpdateFranchiseDto) {
    return this.franchisesService.createFranchise(req.user.userId, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a franchise' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: CreateUpdateFranchiseDto })
  @ApiResponse({ status: 200, type: FranchiseDto })
  updateFranchise(
    @Req() req: any,
    @Param('id') id: number,
    @Body() dto: CreateUpdateFranchiseDto,
  ) {
    return this.franchisesService.updateFranchise(
      req.user.userId,
      Number(id),
      dto,
    )
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a franchise' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Franchise deleted' })
  deleteFranchise(@Req() req: any, @Param('id') id: number) {
    return this.franchisesService.deleteFranchise(
      req.user.userId,
      Number(id),
    )
  }

  @Post(':franchiseId/titles/:titleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach title to franchise' })
  @ApiParam({ name: 'franchiseId', example: 1 })
  @ApiParam({ name: 'titleId', example: 5 })
  @ApiResponse({ status: 200 })
  attachTitle(
    @Req() req: any,
    @Param('franchiseId') franchiseId: number,
    @Param('titleId') titleId: number,
  ) {
    return this.franchisesService.attachTitle(
      req.user.userId,
      Number(franchiseId),
      Number(titleId),
    )
  }

  @Delete(':franchiseId/titles/:titleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detach title from franchise' })
  @ApiParam({ name: 'franchiseId', example: 1 })
  @ApiParam({ name: 'titleId', example: 1 })
  @ApiResponse({ status: 200 })
  detachTitle(
    @Req() req: any,
    @Param('franchiseId') franchiseId: number,
    @Param('titleId') titleId: number,
  ) {
    return this.franchisesService.detachTitle(
      req.user.userId,
      Number(franchiseId),
      Number(titleId),
    )
  }
}