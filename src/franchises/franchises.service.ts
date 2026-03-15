import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUpdateFranchiseDto } from './dto/create-update-franchise.dto'
import { createPaginationOptions, createPaginatedResult, PaginationOptions } from '../common/pagination'

@Injectable()
export class FranchisesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private calculateTitleProgress(current?: number | null, total?: number | null): number {
    if (!total || total <= 0) return 0
    if (!current || current <= 0) return 0

    return Math.min(100, Math.round((current / total) * 100))
  }

  async getUserFranchises(userId: number, options: PaginationOptions = {}) {
    const { skip, take, page, limit } = createPaginationOptions(options);

    const [franchises, total] = await Promise.all([
      this.prisma.franchise.findMany({
        where: { userId },
        include: {
          titles: true, // Still need for stats
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.franchise.count({ where: { userId } }),
    ]);

    const items = franchises.map((franchise) => {
      let totalUnitsSum = 0
      let currentUnitsSum = 0

      franchise.titles.forEach((title) => {
        if (title.totalUnits) {
          totalUnitsSum += title.totalUnits
          currentUnitsSum += title.currentUnit ?? 0
        }
      })

      const franchiseProgress =
        totalUnitsSum > 0
          ? Math.round((currentUnitsSum / totalUnitsSum) * 100)
          : 0

      const titlesCount = franchise.titles.reduce((acc, title) => {
        acc[title.type] = (acc[title.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const statusCount = franchise.titles.reduce((acc, title) => {
        acc[title.status] = (acc[title.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      return {
        ...franchise,
        titles: undefined, // Remove titles from response
        progressPercent: franchiseProgress,
        stats: {
          titlesCount,
          statusCount,
        },
      };
    });

    return createPaginatedResult(items, total, page, limit);
  }

  async getFranchiseById(id: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id },
      include: {
        titles: true,
      },
    })

    if (!franchise) throw new NotFoundException('Franchise not found')

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

    const titlesGrouped = titlesWithProgress.reduce((acc, title) => {
      if (!acc[title.type]) acc[title.type] = [];
      acc[title.type].push(title);
      return acc;
    }, {} as { [key: string]: any[] });

    const titlesCount = titlesWithProgress.reduce((acc, title) => {
      acc[title.type] = (acc[title.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const statusCount = titlesWithProgress.reduce((acc, title) => {
      acc[title.status] = (acc[title.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      ...franchise,
      titles: titlesGrouped,
      progressPercent: franchiseProgress,
      stats: {
        titlesCount,
        statusCount,
      },
    }
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