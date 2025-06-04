import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CODE_500, LEGACY, MSG_500 } from '../constants/constants';

export class BusinessExceptionDto extends Error {
  readonly responseCode: number;
  readonly messageCode: string;
  readonly transactionId: string;
  readonly legacy: string;
  readonly data: any;

  constructor(params: {
    message?: string;
    responseCode?: number;
    messageCode?: string;
    legacy?: string;
    data?: any;
    transactionId?: string;
  }) {
    super(params.message ?? MSG_500);
    this.responseCode = params.responseCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    this.messageCode = params.messageCode ?? CODE_500;
    this.legacy = params.legacy ?? LEGACY;
    this.data = params.data ?? null;
    this.transactionId = params.transactionId ?? uuidv4();
  }
}
