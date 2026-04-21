import {
  BadRequestException,
  ForbiddenException,
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

    // Get own titles + collaborated titles
    const collaboratedTitleIds = (await this.prisma.userTitleCollaborator.findMany({
      where: { userId },
      select: { titleId: true },
    })).map(c => c.titleId);

    // Get titles from franchises where user is a collaborator
    const collaboratedFranchiseIds = (await this.prisma.franchiseCollaborator.findMany({
      where: { userId },
      select: { franchiseId: true },
    })).map(c => c.franchiseId);

    if (type) {
      // Return specific type with pagination
      const where: any = {
        OR: [
          { userId },
          { id: { in: collaboratedTitleIds } },
          {
            franchiseId: { in: collaboratedFranchiseIds },
            userId: { not: userId }
          }
        ],
        type: type as any,
      };
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

      const items = await Promise.all(titles.map((title) =>
        this.formatTitleResponse(title, userId),
      ));

      return createPaginatedResult(items, total, page, limit);
    } else {
      // Return all titles with pagination
      const where: any = {
        OR: [
          { userId },
          { id: { in: collaboratedTitleIds } },
          {
            franchiseId: { in: collaboratedFranchiseIds },
            userId: { not: userId }
          }
        ],
      };
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

      const items = await Promise.all(titles.map((title) =>
        this.formatTitleResponse(title, userId),
      ));

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

    return this.formatTitleResponse(title, userId);
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

    return this.formatTitleResponse(updated, userId);
  }

  async deleteTitle(userId: number, titleId: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    // Если пользователь создатель, удаляем полностью
    if (title.userId === userId) {
      return this.prisma.userTitle.delete({
        where: { id: titleId },
      });
    }

    // Иначе удаляем только коллаборатора из списка
    await this.prisma.userTitleCollaborator.deleteMany({
      where: { titleId, userId },
    });

    return this.getTitleDetail(titleId, userId);
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
        include: { franchise: true, user: true },
        skip,
        take,
      }),
      this.prisma.userTitle.count({ where }),
    ]);

    const items = await Promise.all(titles.map((title) =>
      this.formatTitleResponse(title, filters.userId),
    ));

    return createPaginatedResult(items, total, page, limit);
  }

  private async formatTitleResponse(title: any, currentUserId?: number) {
    const collaborators = await this.prisma.userTitleCollaborator.findMany({
      where: { titleId: title.id },
      include: { user: true },
    });

    return {
      ...title,
      dateStarted: title.dateStarted ? this.formatDate(title.dateStarted) : null,
      dateFinished: title.dateFinished ? this.formatDate(title.dateFinished) : null,
      isOwner: currentUserId ? title.userId === currentUserId : false,
      collaborators: collaborators.map((collab) => ({
        id: collab.user.id,
        nickname: collab.user.nickname,
        avatarUrl: collab.user.avatarUrl,
        level: collab.user.level,
        joinedAt: this.formatDate(collab.joinedAt),
      })),
      progressPercent:
        title.totalUnits && title.totalUnits > 0
          ? Math.round(((title.currentUnit ?? 0) / title.totalUnits) * 100)
          : 0,
    };
  }

  async addCollaborator(userId: number, titleId: number, friendId: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found');
    }

    // Проверяем, что друг существует и они друзья
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId, status: 'ACCEPTED' },
          { requesterId: friendId, addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      throw new ForbiddenException('You are not friends with this user');
    }

    // Проверяем, не добавлен ли уже
    const existing = await this.prisma.userTitleCollaborator.findUnique({
      where: { titleId_userId: { titleId, userId: friendId } },
    });

    if (existing) {
      throw new BadRequestException('User is already a collaborator');
    }

    await this.prisma.userTitleCollaborator.create({
      data: {
        titleId,
        userId: friendId,
      },
    });

    return this.getTitleDetail(titleId, userId);
  }

  async removeCollaborator(userId: number, titleId: number, collaboratorId: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    // Только создатель или сам коллаборатор могут его удалить
    if (title.userId !== userId && collaboratorId !== userId) {
      throw new ForbiddenException('You cannot remove this collaborator');
    }

    // Проверяем, существует ли коллаборатор
    const collaborator = await this.prisma.userTitleCollaborator.findUnique({
      where: { titleId_userId: { titleId, userId: collaboratorId } },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    await this.prisma.userTitleCollaborator.delete({
      where: { titleId_userId: { titleId, userId: collaboratorId } },
    });

    return this.getTitleDetail(titleId, userId);
  }

  async getTitleDetail(titleId: number, userId?: number) {
    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
      include: { franchise: true },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    return this.formatTitleResponse(title, userId);
  }
}
