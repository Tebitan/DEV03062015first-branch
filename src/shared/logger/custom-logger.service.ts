import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LEGACY, SERVICE_NAME } from '../constants/constants';

export interface LogMetadata {  
  legacy?: string;
  request?: any;
  response?: any;
  processingTime?: number;
  transactionId?: string;
  message?: string;
  level?: 'error' | 'warn' | 'log' | 'debug' | 'verbose' | 'info';
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
            applicationName:SERVICE_NAME,
            timestamp,
            level,
            methodName: meta.context || '',
            legacy: meta.legacy || LEGACY,
            transactionId: meta.transactionId,
            request: meta.request || '',
            response: meta.response || '',
            processingTime: meta.processingTime || '',
            message,
          };
          return JSON.stringify(log);
        })
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  log(message: string, metadata: LogMetadata = {}, context?: string) {
    this.logger.info(message, { ...metadata, context });
  }

  error(message: string, metadata: LogMetadata = {}, trace?: string) {
    this.logger.error(message, { ...metadata, trace });
  }

  warn(message: string, metadata: LogMetadata = {}, context?: string) {
    this.logger.warn(message, { ...metadata, context });
  }

  debug(message: string, metadata: LogMetadata = {}, context?: string) {
    this.logger.debug(message, { ...metadata, context });
  }

  verbose(message: string, metadata: LogMetadata = {}, context?: string) {
    this.logger.verbose(message, { ...metadata, context });
  }
}
