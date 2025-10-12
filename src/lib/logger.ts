/**
 * Enterprise-grade logging system
 * Production-ready structured logging with different severity levels
 */

import { env } from './env';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, stack } = entry;

    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
      const stackStr = stack ? `\n${stack}` : '';
      return `[${timestamp}] ${level}: ${message}${contextStr}${stackStr}`;
    }

    // JSON format for production (easier to parse and monitor)
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.log(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error,
    };

    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.ERROR, message, errorContext, stack);
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error,
    };

    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.FATAL, message, errorContext, stack);
  }

  // API request logger
  apiRequest(method: string, path: string, context?: Record<string, any>) {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      type: 'api_request',
    });
  }

  // API response logger
  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`,
      type: 'api_response',
    });
  }

  // Database query logger
  dbQuery(query: string, duration: number, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.debug('Database Query', {
        query,
        duration: `${duration}ms`,
        ...context,
      });
    }
  }
}

export const logger = new Logger();
