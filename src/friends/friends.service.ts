import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationEventsService } from '../notification-events.service';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async sendFriendRequest(requesterId: number, addresseeNickname: string) {
    const addressee = await this.prisma.user.findUnique({
      where: { nickname: addresseeNickname },
    });

    if (!addressee) {
      throw new NotFoundException('User not found');
    }

    if (addressee.id === requesterId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if already friends or request exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Friendship already exists or request pending',
      );
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId: addressee.id,
      },
    });

    // Send notification
    const requesterNickname = await this.getUserNickname(requesterId);
    await this.notificationEvents.sendNotification(
      addressee.id,
      'friend_request',
      {
        requesterNickname,
        friendId: requesterId,
      },
    );

    return friendship;
  }

  async acceptFriendRequest(userId: number, friendId: number) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: friendId, addresseeId: userId, status: 'PENDING' },
          { requesterId: userId, addresseeId: friendId, status: 'PENDING' },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'ACCEPTED' },
    });

    // Send notification to requester
    const accepterNickname = await this.getUserNickname(userId);
    await this.notificationEvents.sendNotification(
      friendId,
      'friend_accepted',
      {
        accepterNickname,
        friendId: userId,
      },
    );

    return updated;
  }

  async removeFriend(userId: number, friendId: number) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    const removedFriendship = await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    // Send notification to the other user
    const removerNickname = await this.getUserNickname(userId);
    await this.notificationEvents.sendNotification(friendId, 'friend_removed', {
      removerNickname,
      friendId: userId,
    });

    return removedFriendship;
  }

  async getFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: { select: { id: true, nickname: true, avatarUrl: true } },
        addressee: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });

    return friendships.map((f) =>
      f.requesterId === userId ? f.addressee : f.requester,
    );
  }

  async getFriendRequests(userId: number) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
      include: {
        requester: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });

    return requests.map((r) => r.requester);
  }

  async getOutgoingFriendRequests(userId: number) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING',
      },
      include: {
        addressee: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });

    return requests.map((r) => r.addressee);
  }

  private async getUserNickname(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true },
    });
    return user?.nickname || 'Unknown';
  }
}
