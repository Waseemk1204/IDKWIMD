import { io, Socket } from 'socket.io-client';
import sessionService from './sessionService';
import logger from '../utils/logger';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    const token = sessionService.getToken();
    if (!token) {
      logger.warn('SocketService - No authentication token found, cannot connect');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      logger.info('SocketService - Connected to server');
      this.emit('presence_update', 'online');
    });

    this.socket.on('disconnect', () => {
      logger.info('SocketService - Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      logger.error('SocketService - Connection error', error);
    });

    // Re-emit all events to registered listeners
    this.socket.onAny((event, ...args) => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(listener => {
          try {
            listener(...args);
          } catch (error) {
            logger.error(`SocketService - Error in event listener for ${event}`, error);
          }
        });
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      logger.warn(`SocketService - Socket not connected, cannot emit event: ${event}`);
    }
  }

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener?: Function): void {
    if (!listener) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Convenience methods for common events
  joinConversation(conversationId: string): void {
    this.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.emit('leave_conversation', conversationId);
  }

  joinChannel(channelId: string): void {
    this.emit('join_channel', channelId);
  }

  leaveChannel(channelId: string): void {
    this.emit('leave_channel', channelId);
  }

  sendMessage(data: {
    conversationId?: string;
    channelId?: string;
    content: string;
    messageType?: string;
    replyTo?: string;
    attachments?: any[];
  }): void {
    this.emit('send_message', data);
  }

  startTyping(conversationId: string, channelId?: string): void {
    this.emit('typing_start', { conversationId, channelId });
  }

  stopTyping(conversationId: string, channelId?: string): void {
    this.emit('typing_stop', { conversationId, channelId });
  }

  addReaction(messageId: string, reactionType: string): void {
    this.emit('add_reaction', { messageId, reactionType });
  }

  initiateCall(data: {
    targetUserId: string;
    conversationId?: string;
    channelId?: string;
    callType: 'audio' | 'video';
  }): void {
    this.emit('call_initiate', data);
  }

  answerCall(callId: string, conversationId?: string, channelId?: string): void {
    this.emit('call_answer', { callId, conversationId, channelId });
  }

  rejectCall(callId: string, conversationId?: string, channelId?: string): void {
    this.emit('call_reject', { callId, conversationId, channelId });
  }

  endCall(callId: string, conversationId?: string, channelId?: string): void {
    this.emit('call_end', { callId, conversationId, channelId });
  }

  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.emit('update_presence', status);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
