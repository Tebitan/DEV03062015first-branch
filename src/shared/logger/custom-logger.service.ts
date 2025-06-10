import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LEGACY, SERVICE_NAME } from '../constants/constants';

export interface LogMetadata {
  legacy?: string;
  request?: any;
  response?: any;
  processingTime?: number;
  transactionId?: string;
  context?: string;
}

export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const log = {
            applicationName: SERVICE_NAME,
            timestamp,
            level,
            methodName: meta.context || '',
            legacy: meta.legacy || LEGACY,
            transactionId: meta.transactionId,
            request: meta.request || '',
            response: meta.response || '',
            processingTime: meta.processingTime || '',
            message: typeof message === 'object'
              ? JSON.stringify(message, null, 2)
              : message,
          };
          return JSON.stringify(log);
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, metadata: LogMetadata = {}, context?: string) {
    const formattedMessage = this.formatMessage(message);
    this.logger.info(formattedMessage, { ...metadata, context });
  }

  error(message: any, metadata: LogMetadata = {}, trace?: string) {
    const formattedMessage = this.formatMessage(message);
    this.logger.error(formattedMessage, { ...metadata, trace });
  }

  warn(message: any, metadata: LogMetadata = {}, context?: string) {
    const formattedMessage = this.formatMessage(message);
    this.logger.warn(formattedMessage, { ...metadata, context });
  }

  debug(message: any, metadata: LogMetadata = {}, context?: string) {
    const formattedMessage = this.formatMessage(message);
    this.logger.debug(formattedMessage, { ...metadata, context });
  }

  verbose(message: any, metadata: LogMetadata = {}, context?: string) {
    const formattedMessage = this.formatMessage(message);
    this.logger.verbose(formattedMessage, { ...metadata, context });
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    if (message instanceof Error) {
      return `${message.name}: ${message.message}`;
    }
    try {
      return JSON.stringify(message, null, 2);
    } catch {
      return 'Unserializable message';
    }
  }
}
