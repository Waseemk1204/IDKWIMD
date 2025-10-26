/**
 * Centralized logging utility for backend
 * Provides structured logging with different levels
 */

import { config } from '../config';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(prefix, message, ...args);
        }
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
      default:
        if (this.isDevelopment) {
          console.log(prefix, message, ...args);
        }
    }
  }

  log(message: string, ...args: any[]): void {
    this.formatMessage('log', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    // Always log errors
    this.formatMessage('error', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  // HTTP request logging
  request(method: string, url: string, status: number, duration: string): void {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      const statusColor = status >= 400 ? 'ERROR' : 'INFO';
      console.log(`[${timestamp}] [${statusColor}] ${method} ${url} ${status} ${duration}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;


