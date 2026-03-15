import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class NotificationEventsService {
  private emitter = new EventEmitter2();

  emitNewNotification(userId: number, notification: any) {
    this.emitter.emit(`notification:${userId}`, notification);
  }

  getEmitter() {
    return this.emitter;
  }
}