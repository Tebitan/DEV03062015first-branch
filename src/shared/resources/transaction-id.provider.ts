import { Scope } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const TransactionIdProvider = {
  provide: 'TransactionId',
  useFactory: () => uuidv4(),
  scope: Scope.REQUEST,
};
