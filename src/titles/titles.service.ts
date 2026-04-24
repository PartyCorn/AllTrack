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
    favorite?: boolean,
  ) {
    const { skip, take, page, limit, sortBy, sortOrder } =
      createPaginationOptions(options);

    if (type) {
      // Return specific type with pagination
      const where: any = { userId, type: type as any };
      if (excludeFranchiseTitles) {
        where.franchiseId = null;
      }
      if (favorite !== undefined) {
        where.favorite = favorite;
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
        dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
        dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
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
      if (favorite !== undefined) {
        where.favorite = favorite;
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
        dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
        dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
        progressPercent:
          title.totalUnits && title.totalUnits > 0
            ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
            : 0,
      }));

      return createPaginatedResult(items, total, page, limit);
    }
  }

  private parseDateString(value: string, field: string): Date {
    const match = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(value);
    if (!match) {
      throw new BadRequestException(`${field} must be in DD.MM.YYYY format`);
    }

    const [, dayString, monthString, yearString] = match;
    const day = Number(dayString);
    const month = Number(monthString) - 1;
    const year = Number(yearString);
    const parsed = new Date(Date.UTC(year, month, day));

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month ||
      parsed.getUTCDate() !== day
    ) {
      throw new BadRequestException(`${field} must be a valid date in DD.MM.YYYY format`);
    }

    return parsed;
  }

  private formatDate(date?: Date | null): string | null {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}.${month}.${year}`;
  }

  private validateTitleData(
    totalUnits?: number,
    currentUnit?: number,
    rating?: number,
    note?: string,
    revisitCount?: number,
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

    if (revisitCount !== undefined && revisitCount < 0) {
      throw new BadRequestException('revisitCount cannot be negative');
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
      dto.revisitCount,
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

    const { dateStarted, dateFinished, ...restDto } = dto as any;

    const title = await this.prisma.userTitle.create({
      data: {
        ...restDto,
        userId,
        currentUnit: dto.currentUnit ?? 0,
        status,
        ...(dateStarted
          ? { dateStarted: this.parseDateString(dateStarted, 'dateStarted') }
          : {}),
        ...(dateFinished
          ? { dateFinished: this.parseDateString(dateFinished, 'dateFinished') }
          : {}),
      },
    });

    // await this.gamificationService.addXp(userId, 10)

    // если создали сразу завершённым
    // if (status === 'COMPLETED') {
    //   await this.gamificationService.addXp(userId, 25)
    // }

    // Check for achievements
    await this.achievementsService.checkAndAwardAchievements(userId);

    return {
      ...title,
      dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
      dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
    };
  }

  async getTitleById(titleId: number, userId?: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
      include: {
        franchise: true,
        user: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    const isOwner = title.userId === userId;

    if (!isOwner) {
      const owner = await this.prisma.user.findUnique({
        where: { id: title.userId },
        select: { isPrivate: true },
      });
      if (owner?.isPrivate) {
        throw new NotFoundException('Title not found');
      }
    }

    return {
      ...title,
      dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
      dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
      progressPercent:
        title.totalUnits && title.totalUnits > 0
          ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
          : 0,
    };
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
    const revisitCount = dto.revisitCount ?? existing.revisitCount;

    this.validateTitleData(totalUnits!, currentUnit!, rating!, note!, revisitCount);

    let status = dto.status ?? existing.status;

    // авто COMPLETED если прогресс достигнут
    if (
      totalUnits !== undefined &&
      currentUnit !== undefined &&
      currentUnit === totalUnits
    ) {
      status = 'COMPLETED';
    }

    const { dateStarted, dateFinished, ...restDto } = dto as any;

    const updated = await this.prisma.userTitle.update({
      where: { id: titleId },
      data: {
        ...restDto,
        status,
        ...(dateStarted
          ? { dateStarted: this.parseDateString(dateStarted, 'dateStarted') }
          : {}),
        ...(dateFinished
          ? { dateFinished: this.parseDateString(dateFinished, 'dateFinished') }
          : {}),
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

    return {
      ...updated,
      dateStarted: updated.dateStarted ? this.formatDate(updated.dateStarted) : null,
      dateFinished: updated.dateFinished ? this.formatDate(updated.dateFinished) : null,
    };
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

    if (filters.favorite !== undefined) {
      where.favorite = filters.favorite;
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
        include: {
          franchise: true,
          user: { select: { id: true, nickname: true, avatarUrl: true } },
        },
        skip,
        take,
      }),
      this.prisma.userTitle.count({ where }),
    ]);

    const items = titles.map((title) => ({
      ...title,
      dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
      dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
      progressPercent:
        title.totalUnits && title.totalUnits > 0
          ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
          : 0,
    }));

    return createPaginatedResult(items, total, page, limit);
  }

  async globalTitleSearch(filters: any, options: any) {
    const { skip, take, page, limit } = createPaginationOptions(options);

    // Get all public users first
    const publicUsers = await this.prisma.user.findMany({
      where: { isPrivate: false },
      select: { id: true },
    });

    const publicUserIds = publicUsers.map((u) => u.id);

    if (publicUserIds.length === 0) {
      return createPaginatedResult([], 0, page, limit);
    }

    const where: any = {
      userId: { in: publicUserIds },
    };

    if (filters.q) {
      where.title = { contains: filters.q, mode: 'insensitive' };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [titles, total] = await Promise.all([
      this.prisma.userTitle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          franchise: true,
          user: { select: { id: true, nickname: true, avatarUrl: true } },
        },
        skip,
        take,
      }),
      this.prisma.userTitle.count({ where }),
    ]);

    const items = titles.map((title) => ({
      ...title,
      dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
      dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
      progressPercent:
        title.totalUnits && title.totalUnits > 0
          ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
          : 0,
    }));

    return createPaginatedResult(items, total, page, limit);
  }
}
