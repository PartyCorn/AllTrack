import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUpdateTitleDto } from './dto/create-update-title.dto'
import { GamificationService } from '../gamification/gamification.service'

@Injectable()
export class TitlesService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async getUserTitles(userId: number) {
    const titles = await this.prisma.userTitle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { franchise: true }
    })

    return titles.map((title) => ({
        ...title,
        progressPercent:
        title.totalUnits && title.totalUnits > 0
            ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
            : 0,
    }))
    }

  private validateTitleData(
    totalUnits?: number,
    currentUnit?: number,
    rating?: number,
    note?: string,
  ) {
    if (currentUnit !== undefined && currentUnit < 0) {
      throw new BadRequestException('currentUnit cannot be negative')
    }

    if (
      totalUnits !== undefined &&
      currentUnit !== undefined &&
      currentUnit > totalUnits
    ) {
      throw new BadRequestException(
        'currentUnit cannot exceed totalUnits',
      )
    }

    if (rating !== undefined && (rating < 0 || rating > 10)) {
      throw new BadRequestException('rating must be between 0 and 10')
    }

    if (note && note.length > 500) {
      throw new BadRequestException('note cannot exceed 500 characters')
    }
  }

  async createTitle(userId: number, dto: CreateUpdateTitleDto) {
    this.validateTitleData(
      dto.totalUnits,
      dto.currentUnit,
      dto.rating,
      dto.note,
    )

    let status = dto.status ?? 'PLANNED'

    // авто COMPLETED если прогресс == максимум
    if (
      dto.totalUnits !== undefined &&
      dto.currentUnit !== undefined &&
      dto.currentUnit === dto.totalUnits
    ) {
      status = 'COMPLETED'
    }

    const title = await this.prisma.userTitle.create({
      data: {
        ...dto,
        userId,
        currentUnit: dto.currentUnit ?? 0,
        status,
      },
    })

    await this.gamificationService.addXp(userId, 10)

    // если создали сразу завершённым
    if (status === 'COMPLETED') {
      await this.gamificationService.addXp(userId, 25)
    }

    return title
  }

  async updateTitle(
    userId: number,
    titleId: number,
    dto: CreateUpdateTitleDto,
  ) {
    const existing = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    })

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Title not found')
    }

    const totalUnits = dto.totalUnits ?? existing.totalUnits
    const currentUnit = dto.currentUnit ?? existing.currentUnit
    const rating = dto.rating ?? existing.rating
    const note = dto.note ?? existing.note

    this.validateTitleData(totalUnits!, currentUnit!, rating!, note!)

    let status = dto.status ?? existing.status

    // авто COMPLETED если прогресс достигнут
    if (
      totalUnits !== undefined &&
      currentUnit !== undefined &&
      currentUnit === totalUnits
    ) {
      status = 'COMPLETED'
    }

    const updated = await this.prisma.userTitle.update({
      where: { id: titleId },
      data: {
        ...dto,
        status,
      },
    })

    // XP если впервые завершили
    if (
      status === 'COMPLETED' &&
      existing.status !== 'COMPLETED'
    ) {
      await this.gamificationService.addXp(userId, 25)
    }

    return updated
  }

  async deleteTitle(userId: number, titleId: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    })

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found')
    }

    await this.gamificationService.addXp(userId, -10)

    return this.prisma.userTitle.delete({
      where: { id: titleId },
    })
  }
}