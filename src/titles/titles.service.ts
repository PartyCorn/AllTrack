import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUpdateTitleDto } from './dto/create-update-title.dto';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementsService } from '../achievements/achievements.service';
import {
  createPaginationOptions,
  createPaginatedResult,
  PaginationOptions,
} from '../common/pagination';

@Injectable()
export class TitlesService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private achievementsService: AchievementsService,
    private configService: ConfigService,
  ) {}

  async getUserTitles(
    userId: number,
    options: any = {},
    type?: string,
    excludeFranchiseTitles: boolean = false,
  ) {
    const { skip, take, page, limit, sortBy, sortOrder } =
      createPaginationOptions(options);

    if (type) {
      // Return specific type with pagination
      const where: any = { userId, type: type as any };
      if (excludeFranchiseTitles) {
        where.franchiseId = null;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy) {
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        if (sortBy === 'title') {
          orderBy = { title: order };
        } else if (sortBy === 'rating') {
          orderBy = { rating: order };
        } else if (sortBy === 'status') {
          orderBy = { status: order };
        } else if (sortBy === 'createdAt') {
          orderBy = { createdAt: order };
        }
      }

      const [titles, total] = await Promise.all([
        this.prisma.userTitle.findMany({
          where,
          orderBy,
          include: { franchise: true },
          skip,
          take,
        }),
        this.prisma.userTitle.count({ where }),
      ]);

      const items = titles.map((title) => ({
        ...title,
        progressPercent:
          title.totalUnits && title.totalUnits > 0
            ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
            : 0,
      }));

      return createPaginatedResult(items, total, page, limit);
    } else {
      // Return all titles with pagination
      const where: any = { userId };
      if (excludeFranchiseTitles) {
        where.franchiseId = null;
      }
      const [titles, total] = await Promise.all([
        this.prisma.userTitle.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { franchise: true },
          skip,
          take,
        }),
        this.prisma.userTitle.count({ where }),
      ]);

      const items = titles.map((title) => ({
        ...title,
        progressPercent:
          title.totalUnits && title.totalUnits > 0
            ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
            : 0,
      }));

      return createPaginatedResult(items, total, page, limit);
    }
  }

  private validateTitleData(
    totalUnits?: number,
    currentUnit?: number,
    rating?: number,
    note?: string,
  ) {
    if (currentUnit !== undefined && currentUnit < 0) {
      throw new BadRequestException('currentUnit cannot be negative');
    }

    if (
      totalUnits !== undefined &&
      currentUnit !== undefined &&
      currentUnit > totalUnits
    ) {
      throw new BadRequestException('currentUnit cannot exceed totalUnits');
    }

    if (rating !== undefined && (rating < 0 || rating > 10)) {
      throw new BadRequestException('rating must be between 0 and 10');
    }

    if (note && note.length > 500) {
      throw new BadRequestException('note cannot exceed 500 characters');
    }
  }

  async createTitle(userId: number, dto: CreateUpdateTitleDto) {
    this.validateTitleData(
      dto.totalUnits,
      dto.currentUnit,
      dto.rating,
      dto.note,
    );

    // Validate franchise title limit
    if (dto.franchiseId) {
      const franchiseTitlesCount = await this.prisma.userTitle.count({
        where: { franchiseId: dto.franchiseId },
      });
      const maxTitles = this.configService.get<number>(
        'franchises.maxTitles',
        100,
      );
      if (franchiseTitlesCount >= maxTitles) {
        throw new BadRequestException(
          `Franchise cannot have more than ${maxTitles} titles`,
        );
      }
    }

    let status = dto.status ?? 'PLANNED';

    // авто COMPLETED если прогресс == максимум
    if (
      dto.totalUnits !== undefined &&
      dto.currentUnit !== undefined &&
      dto.currentUnit === dto.totalUnits
    ) {
      status = 'COMPLETED';
    }

    const title = await this.prisma.userTitle.create({
      data: {
        ...dto,
        userId,
        currentUnit: dto.currentUnit ?? 0,
        status,
      },
    });

    // await this.gamificationService.addXp(userId, 10)

    // если создали сразу завершённым
    // if (status === 'COMPLETED') {
    //   await this.gamificationService.addXp(userId, 25)
    // }

    // Check for achievements
    await this.achievementsService.checkAndAwardAchievements(userId);

    return title;
  }

  async updateTitle(
    userId: number,
    titleId: number,
    dto: CreateUpdateTitleDto,
  ) {
    const existing = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Title not found');
    }

    const totalUnits = dto.totalUnits ?? existing.totalUnits;
    const currentUnit = dto.currentUnit ?? existing.currentUnit;
    const rating = dto.rating ?? existing.rating;
    const note = dto.note ?? existing.note;

    this.validateTitleData(totalUnits!, currentUnit!, rating!, note!);

    let status = dto.status ?? existing.status;

    // авто COMPLETED если прогресс достигнут
    if (
      totalUnits !== undefined &&
      currentUnit !== undefined &&
      currentUnit === totalUnits
    ) {
      status = 'COMPLETED';
    }

    const updated = await this.prisma.userTitle.update({
      where: { id: titleId },
      data: {
        ...dto,
        status,
      },
    });

    // XP если впервые завершили
    // if (
    //   status === 'COMPLETED' &&
    //   existing.status !== 'COMPLETED'
    // ) {
    //   await this.gamificationService.addXp(userId, 25)
    // }

    // Check for achievements
    await this.achievementsService.checkAndAwardAchievements(userId);

    return updated;
  }

  async deleteTitle(userId: number, titleId: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found');
    }

    // await this.gamificationService.addXp(userId, -10)

    return this.prisma.userTitle.delete({
      where: { id: titleId },
    });
  }

  async searchTitles(filters: any, options: any) {
    const { skip, take, page, limit, sortBy, sortOrder } =
      createPaginationOptions(options);

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.q) {
      where.title = { contains: filters.q, mode: 'insensitive' };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ratingMin !== undefined || filters.ratingMax !== undefined) {
      where.rating = {};
      if (filters.ratingMin !== undefined) {
        where.rating.gte = filters.ratingMin;
      }
      if (filters.ratingMax !== undefined) {
        where.rating.lte = filters.ratingMax;
      }
    }

    if (filters.franchiseId) {
      where.franchiseId = filters.franchiseId;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      if (sortBy === 'title') {
        orderBy = { title: order };
      } else if (sortBy === 'rating') {
        orderBy = { rating: order };
      } else if (sortBy === 'status') {
        orderBy = { status: order };
      } else if (sortBy === 'createdAt') {
        orderBy = { createdAt: order };
      }
    }

    const [titles, total] = await Promise.all([
      this.prisma.userTitle.findMany({
        where,
        orderBy,
        include: { franchise: true, user: true },
        skip,
        take,
      }),
      this.prisma.userTitle.count({ where }),
    ]);

    const items = titles.map((title) => ({
      ...title,
      progressPercent:
        title.totalUnits && title.totalUnits > 0
          ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
          : 0,
    }));

    return createPaginatedResult(items, total, page, limit);
  }
}
