/**
 * Centralized logging utility for the frontend application
 * Provides structured logging with different log levels and contexts
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private name: string;
  private colors = {
    DEBUG: '#6B7280', // Gray
    INFO: '#3B82F6',  // Blue
    WARN: '#F59E0B',  // Orange
    ERROR: '#EF4444', // Red
  };

  constructor(name: string) {
    this.name = name;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const color = this.colors[level];

    const logArgs = [
      `%c[${timestamp}] ${level} [${this.name}]%c ${message}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
    ];

    if (context) {
      logArgs.push('\nContext:', context);
    }

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(...logArgs);
        break;
      case LogLevel.INFO:
        console.log(...logArgs);
        break;
      case LogLevel.WARN:
        console.warn(...logArgs);
        break;
      case LogLevel.ERROR:
        console.error(...logArgs);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    this.formatMessage(LogLevel.ERROR, message, errorContext);
  }

  // Performance tracking
  time(label: string): void {
    console.time(`[${this.name}] ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`[${this.name}] ${label}`);
  }

  // Group related logs
  group(label: string): void {
    console.group(`[${this.name}] ${label}`);
  }

  groupEnd(): void {
    console.groupEnd();
  }
}

// Pre-configured loggers for different parts of the application
export const apiLogger = new Logger('API');
export const authLogger = new Logger('Auth');
export const uiLogger = new Logger('UI');
export const wsLogger = new Logger('WebSocket');
export const rtcLogger = new Logger('WebRTC');

// Factory function to create custom loggers
export function createLogger(name: string): Logger {
  return new Logger(name);
}

export default Logger;
