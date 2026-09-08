import { io, Socket } from 'socket.io-client';
import { ChatMessage, AppNotification } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: ((msg: ChatMessage) => void)[] = [];
  private notificationListeners: ((notif: AppNotification) => void)[] = [];
  private typingListeners: ((data: { userId: string; name: string; departmentSlug: string }) => void)[] = [];
  private stopTypingListeners: ((data: { userId: string; departmentSlug: string }) => void)[] = [];

  public connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket connected to Nexus real-time server');
    });

    this.socket.on('message:new', (message: ChatMessage) => {
      this.messageListeners.forEach((fn) => fn(message));
    });

    this.socket.on('notification:new', (notification: AppNotification) => {
      this.notificationListeners.forEach((fn) => fn(notification));
    });

    this.socket.on('user:typing', (data) => {
      this.typingListeners.forEach((fn) => fn(data));
    });

    this.socket.on('user:stop_typing', (data) => {
      this.stopTypingListeners.forEach((fn) => fn(data));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public sendMessage(departmentSlug: string, content: string, attachmentUrls?: string) {
    if (!this.socket) return;
    this.socket.emit('message:send', { departmentSlug, content, attachmentUrls });
  }

  public startTyping(departmentSlug: string) {
    if (!this.socket) return;
    this.socket.emit('typing:start', { departmentSlug });
  }

  public stopTyping(departmentSlug: string) {
    if (!this.socket) return;
    this.socket.emit('typing:stop', { departmentSlug });
  }

  public onMessage(callback: (msg: ChatMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((fn) => fn !== callback);
    };
  }

  public onNotification(callback: (notif: AppNotification) => void) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter((fn) => fn !== callback);
    };
  }

  public onTyping(callback: (data: { userId: string; name: string; departmentSlug: string }) => void) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter((fn) => fn !== callback);
    };
  }

  public onStopTyping(callback: (data: { userId: string; departmentSlug: string }) => void) {
    this.stopTypingListeners.push(callback);
    return () => {
      this.stopTypingListeners = this.stopTypingListeners.filter((fn) => fn !== callback);
    };
  }
}

export const socketService = new SocketService();
