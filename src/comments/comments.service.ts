import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationEventsService } from '../notification-events.service';
import { createPaginationOptions, createPaginatedResult, PaginationOptions } from '../common/pagination';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async createComment(authorId: number, profileId: number, content: string) {
    if (authorId === profileId) {
      throw new ForbiddenException('Cannot comment on your own profile');
    }

    const comment = await this.prisma.comment.create({
      data: {
        authorId,
        profileId,
        content,
      },
      include: {
        author: { select: { nickname: true } },
      },
    });

    // Send notification to profile owner
    await this.notificationEvents.sendNotification(profileId, 'comment', {
      commenterNickname: comment.author.nickname,
      commentId: comment.id,
    });

    return comment;
  }

  async getProfileComments(profileId: number, options: PaginationOptions = {}) {
    const { skip, take, page, limit } = createPaginationOptions(options);

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { profileId },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.comment.count({ where: { profileId } }),
    ]);

    return createPaginatedResult(comments, total, page, limit);
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Cannot edit this comment');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Cannot delete this comment');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}