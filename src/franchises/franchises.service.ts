import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUpdateFranchiseDto } from './dto/create-update-franchise.dto';
import {
  createPaginationOptions,
  createPaginatedResult,
  PaginationOptions,
} from '../common/pagination';

@Injectable()
export class FranchisesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private calculateTitleProgress(
    current?: number | null,
    total?: number | null,
  ): number {
    if (!total || total <= 0) return 0;
    if (!current || current <= 0) return 0;

    return Math.min(100, Math.round((current / total) * 100));
  }

  async getUserFranchises(userId: number, options: PaginationOptions = {}) {
    const { skip, take, page, limit, sortBy, sortOrder } =
      createPaginationOptions(options);

    // Get own franchises + collaborated franchises
    const collaboratedFranchiseIds = (await this.prisma.franchiseCollaborator.findMany({
      where: { userId },
      select: { franchiseId: true },
    })).map(c => c.franchiseId);

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      if (sortBy === 'name') {
        orderBy = { name: order };
      } else if (sortBy === 'createdAt') {
        orderBy = { createdAt: order };
      }
    }

    const [franchises, total] = await Promise.all([
      this.prisma.franchise.findMany({
        where: {
          OR: [
            { userId },
            { id: { in: collaboratedFranchiseIds } }
          ]
        },
        include: {
          titles: true,
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.franchise.count({
        where: {
          OR: [
            { userId },
            { id: { in: collaboratedFranchiseIds } }
          ]
        }
      }),
    ]);

    const items = await Promise.all(franchises.map((franchise) =>
      this.formatFranchiseResponse(franchise, userId),
    ));

    return createPaginatedResult(items, total, page, limit);
  }

  private async formatFranchiseResponse(franchise: any, currentUserId?: number) {
    let totalUnitsSum = 0;
    let currentUnitsSum = 0;

    franchise.titles.forEach((title: any) => {
      if (title.totalUnits) {
        totalUnitsSum += title.totalUnits;
        currentUnitsSum += title.currentUnit ?? 0;
      }
    });

    const franchiseProgress =
      totalUnitsSum > 0
        ? Math.round((currentUnitsSum / totalUnitsSum) * 100)
        : 0;

    const titlesCount = franchise.titles.reduce(
      (acc: any, title: any) => {
        acc[title.type] = (acc[title.type] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const statusCount = franchise.titles.reduce(
      (acc: any, title: any) => {
        acc[title.status] = (acc[title.status] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const collaborators = await this.prisma.franchiseCollaborator.findMany({
      where: { franchiseId: franchise.id },
      include: { user: true },
    });

    return {
      ...franchise,
      isOwner: currentUserId ? franchise.userId === currentUserId : false,
      collaborators: collaborators.map((collab) => ({
        id: collab.user.id,
        nickname: collab.user.nickname,
        avatarUrl: collab.user.avatarUrl,
        level: collab.user.level,
        joinedAt: this.formatDate(collab.joinedAt),
      })),
      progressPercent: franchiseProgress,
      stats: {
        titlesCount,
        statusCount,
      },
    };
  }

  async getFranchiseById(id: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id },
      include: {
        titles: true,
      },
    });

    if (!franchise) throw new NotFoundException('Franchise not found');

    return this.formatFranchiseResponse(franchise);
  }

  async createFranchise(userId: number, dto: CreateUpdateFranchiseDto) {
    return this.prisma.franchise.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updateFranchise(
    userId: number,
    franchiseId: number,
    dto: CreateUpdateFranchiseDto,
  ) {
    const existing = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Franchise not found');
    }

    return this.prisma.franchise.update({
      where: { id: franchiseId },
      data: dto,
    });
  }

  async deleteFranchise(userId: number, franchiseId: number) {
    const existing = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!existing) {
      throw new NotFoundException('Franchise not found');
    }

    // Если пользователь создатель, удаляем полностью
    if (existing.userId === userId) {
      return this.prisma.franchise.delete({
        where: { id: franchiseId },
      });
    }

    // Иначе удаляем только коллаборатора из списка
    await this.prisma.franchiseCollaborator.deleteMany({
      where: { franchiseId, userId },
    });

    return this.getFranchiseDetail(franchiseId, userId);
  }

  async attachTitle(userId: number, franchiseId: number, titleId: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise || franchise.userId !== userId) {
      throw new NotFoundException('Franchise not found');
    }

    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found');
    }

    if (title.franchiseId === franchiseId) {
      throw new BadRequestException('Title already attached');
    }

    return this.prisma.userTitle.update({
      where: { id: titleId },
      data: { franchiseId },
    });
  }

  async detachTitle(userId: number, franchiseId: number, titleId: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise || franchise.userId !== userId) {
      throw new NotFoundException('Franchise not found');
    }

    const title = await this.prisma.userTitle.findUnique({
      where: { id: titleId },
    });

    if (!title || title.userId !== userId) {
      throw new NotFoundException('Title not found');
    }

    if (title.franchiseId !== franchiseId) {
      throw new BadRequestException('Title is not attached to this franchise');
    }

    return this.prisma.userTitle.update({
      where: { id: titleId },
      data: { franchiseId: null },
    });
  }

  private formatDate(date?: Date | null): string | null {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}.${month}.${year}`;
  }

  async addCollaborator(userId: number, franchiseId: number, friendId: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise || franchise.userId !== userId) {
      throw new NotFoundException('Franchise not found');
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
    const existing = await this.prisma.franchiseCollaborator.findUnique({
      where: { franchiseId_userId: { franchiseId, userId: friendId } },
    });

    if (existing) {
      throw new BadRequestException('User is already a collaborator');
    }

    await this.prisma.franchiseCollaborator.create({
      data: {
        franchiseId,
        userId: friendId,
      },
    });

    return this.getFranchiseDetail(franchiseId, userId);
  }

  async removeCollaborator(userId: number, franchiseId: number, collaboratorId: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise) {
      throw new NotFoundException('Franchise not found');
    }

    // Только создатель или сам коллаборатор могут его удалить
    if (franchise.userId !== userId && collaboratorId !== userId) {
      throw new ForbiddenException('You cannot remove this collaborator');
    }

    // Проверяем, существует ли коллаборатор
    const collaborator = await this.prisma.franchiseCollaborator.findUnique({
      where: { franchiseId_userId: { franchiseId, userId: collaboratorId } },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    await this.prisma.franchiseCollaborator.delete({
      where: { franchiseId_userId: { franchiseId, userId: collaboratorId } },
    });

    return this.getFranchiseDetail(franchiseId, userId);
  }

  async getFranchiseDetail(franchiseId: number, currentUserId?: number) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
      include: { titles: true },
    });

    if (!franchise) {
      throw new NotFoundException('Franchise not found');
    }

    return this.formatFranchiseResponse(franchise, currentUserId);
  }
}
