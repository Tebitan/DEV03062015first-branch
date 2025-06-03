import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './shared/config/configuration';
import { validationSchema } from './shared/config/validation-configuration';
import { AllExceptionsFilter } from './shared/filters/exceptions-manager.filter';
import { FaqModule } from './faq/faq.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { TransactionIdProvider } from './shared/resources/transaction-id.provider';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    FaqModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const timeout = parseInt(configService.get('GLOBAL_TIMEOUT_MS') || '3000', 10);
        return new TimeoutInterceptor(timeout);
      },
    }
  ],
})
export class AppModule { }
