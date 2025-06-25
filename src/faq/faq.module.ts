import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../shared/infrastructure/mongodb/mongodb.module';
import { MongoService } from './infrastructure/mongo/mongo.service';
import { TransactionIdProvider } from '../shared/providers/transaction-id.provider';
import { HttpProviderModule } from '../shared/infrastructure/http/http-provider.module';
import { Faq, FaqSchema } from './infrastructure/mongo/schemas/faq.schema';
import { ClientRestService } from './infrastructure/http/rest/client-rest.service';
import { CacheProviderModule } from '../shared/infrastructure/cache/cache-provider.module';
import { FaqService } from './application/faq.service';
import { FaqController } from './controllers/faq.controller';
import { AdapterCacheService } from './infrastructure/cache/adapter-cache.service';

/**
 * Módulo de NestJS que agrupa el controller, service y las dependencias necesarias para FAQs
 */
@Module({
  imports: [
    ConfigModule,
    MongodbModule,
    MongooseModule.forFeatureAsync([
      {
        inject: [ConfigService],
        name: Faq.name,
        useFactory: (config: ConfigService) => {
          FaqSchema.set('collection', config.get<string>('MONGO_FAQ_COLLECTION'));
          return FaqSchema;
        },
      },
    ]),
    HttpProviderModule,
    CacheProviderModule
  ],
  controllers: [FaqController],
  providers: [TransactionIdProvider, FaqService, MongoService, ClientRestService, AdapterCacheService],
})
export class FaqModule { }
