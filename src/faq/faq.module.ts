import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../shared/infrastructure/mongodb/mongodb.module';
import { MongoService } from './infrastructure/mongo/mongo.service';
import { Faq, FaqSchema } from './infrastructure/mongo/schemas/faq.schema';
import { FaqService } from './application/faq.service';
import { FaqController } from './controllers/faq.controller';
import { TransactionIdProvider } from '../shared/providers/transaction-id.provider';

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

  ],
  controllers: [FaqController],
  providers: [TransactionIdProvider,FaqService, MongoService],
})
export class FaqModule { }
