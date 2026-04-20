import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class NotificationEventsService {
  constructor(private prisma: PrismaService) {}

  private emitter = new EventEmitter2();

  async sendNotification(userId: number, type: string, data: any) {
    let title: string;
    let message: string;

    switch (type) {
      case 'friend_request':
        title = 'Заявка в друзья';
        message = `Пользователь ${data.requesterNickname || 'кто-то'} хочет добавить вас в друзья`;
        break;
      case 'friend_accepted':
        title = 'Заявка принята';
        message = `Пользователь ${data.accepterNickname || 'кто-то'} принял вашу заявку в друзья`;
        break;
      case 'friend_removed':
        title = 'Удален из друзей';
        message = `Пользователь ${data.removerNickname || 'кто-то'} удалил вас из друзей`;
        break;
      case 'comment':
        title = 'Новый комментарий';
        message = `Пользователь ${data.commenterNickname || 'кто-то'} оставил комментарий на вашем профиле`;
        break;
      case 'in_progress_reminder':
        title = 'Напоминание о просмотре';
        message = `Не забудьте посмотреть "${data.titleName || 'ваш тайтл'}"`;
        break;
      default:
        title = 'Уведомление';
        message = 'У вас новое уведомление';
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });

    this.emitNewNotification(userId, notification);
  }

  emitNewNotification(userId: number, notification: any) {
    this.emitter.emit(`notification:${userId}`, notification);
  }

  getEmitter() {
    return this.emitter;
  }
}