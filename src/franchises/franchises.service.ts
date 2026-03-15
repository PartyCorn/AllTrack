import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUpdateFranchiseDto } from './dto/create-update-franchise.dto'

@Injectable()
export class FranchisesService {
  constructor(private prisma: PrismaService) {}

  private calculateTitleProgress(current?: number | null, total?: number | null): number {
    if (!total || total <= 0) return 0
    if (!current || current <= 0) return 0

    return Math.min(100, Math.round((current / total) * 100))
  }

  async getUserFranchises(userId: number) {
    const franchises = await this.prisma.franchise.findMany({
      where: { userId },
      include: {
        titles: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return franchises.map((franchise) => {
      let totalUnitsSum = 0
      let currentUnitsSum = 0

      const titlesWithProgress = franchise.titles.map((title) => {
        const progress = this.calculateTitleProgress(
          title.currentUnit,
          title.totalUnits,
        )

        if (title.totalUnits) {
          totalUnitsSum += title.totalUnits
          currentUnitsSum += title.currentUnit ?? 0
        }

        return {
          ...title,
          progressPercent: progress,
        }
      })

      const franchiseProgress =
        totalUnitsSum > 0
          ? Math.round((currentUnitsSum / totalUnitsSum) * 100)
          : 0

      return {
        ...franchise,
        titles: titlesWithProgress,
        progressPercent: franchiseProgress,
      }
    })
  }

  async createFranchise(userId: number, dto: CreateUpdateFranchiseDto) {
    return this.prisma.franchise.create({
      data: {
        ...dto,
        userId,
      },
    })
  }

  async updateFranchise(userId: number, franchiseId: number, dto: CreateUpdateFranchiseDto) {
    const existing = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    })

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Franchise not found')
    }

    return this.prisma.franchise.update({
      where: { id: franchiseId },
      data: dto,
    })
  }

  async deleteFranchise(userId: number, franchiseId: number) {
    const existing = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    })

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Franchise not found')
    }

    return this.prisma.franchise.delete({
      where: { id: franchiseId },
    })
  }

  async attachTitle(
    userId: number,
    franchiseId: number,
    titleId: number,
  ) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    })

    if (!franchise || franchise.userId !== userId) {
      throw new NotFoundException('Franchise not found')
    }

    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    })

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found')
    }

    if (title.franchiseId === franchiseId) {
      throw new BadRequestException('Title already attached')
    }

    return this.prisma.userTitle.update({
      where: { id: titleId },
      data: { franchiseId },
    })
  }

  async detachTitle(
    userId: number,
    franchiseId: number,
    titleId: number,
  ) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    })

    if (!franchise || franchise.userId !== userId) {
      throw new NotFoundException('Franchise not found')
    }

    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    })

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found')
    }
    
    if (title.franchiseId !== franchiseId) {
      throw new BadRequestException('Title is not attached to this franchise')
    }

    return this.prisma.userTitle.update({
      where: { id: titleId },
      data: { franchiseId: null },
    })
  }
}