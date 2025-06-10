import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { MongoRepository } from '../../../shared/infrastructure/mongodb/mongodb.repository';
import { IMongoService } from './interfaces/mongo.service.interface';
import { Faq } from './schemas/faq.schema';
import { FaqEntity } from '../../domain/entities/faq.entity';
import { ConfigService } from '@nestjs/config';
import { LEGACY_MONGODB } from '../../../shared/constants/constants';
import { MongoQueryOptionsDto } from '../../../shared/domain/mongo-query-options.dto';

/**
 * Servicio de acceso a datos para FAQs implementado sobre MongoDB con Mongoose.
 *
 * Esta clase hereda del repositorio base `MongoRepository` y proporciona
 * métodos específicos del dominio de preguntas frecuentes.
 *
 * Características:
 * - Inserta, consulta y filtra documentos en la colección `faq`.
 * - Aplica `maxTimeMS` para limitar el tiempo de ejecución.
 * - Utiliza `LoggerService` para registrar operaciones detalladas con `transactionId`.
 * - Expone métodos que cumplen con el contrato `IMongoService`.
 */
@Injectable()
export class MongoService
  extends MongoRepository<Faq, FaqEntity>
  implements IMongoService {
  private readonly logger = new Logger(MongoService.name);
  private readonly collection: string;
  private readonly maxTimeMS: number;
  private readonly embeddingsIndex: string;
  private readonly embeddingsField: string;
  private readonly embeddingsResult: number;
  private readonly embeddingsCandidates: number;
  private readonly embeddingsLimit: number;

  constructor(
    @InjectModel(Faq.name) faqModel: Model<Faq & Document>,
    private readonly configService: ConfigService,
    @Inject('TransactionId') private readonly transactionId: string,
  ) {
    super(faqModel);
    this.collection = this.configService.get<string>('MONGO_FAQ_COLLECTION') ?? 'faq';
    this.maxTimeMS = this.configService.get<number>('MONGO_QUERY_TIMEOUT', 5000);
    this.embeddingsIndex = this.configService.get<string>('MONGO_EMBEDDINGS_INDEX') ?? 'ind_emb_faq';
    this.embeddingsField = this.configService.get<string>('MONGO_EMBEDDINGS_FIELD') ?? 'embedding';
    this.embeddingsResult = this.configService.get<number>('MONGO_EMBEDDINGS_RESULT', 1);
    this.embeddingsCandidates = this.configService.get<number>('MONGO_EMBEDDINGS_CANDIDATES', 50);
    this.embeddingsLimit = this.configService.get<number>('MONGO_EMBEDDINGS_LIMIT', 1);
  }

  /**
   * Realiza la búsqueda vectorial
   * @param embedding vectores generados IA
   * @returns  Lista de FAQs encontradas
   */
  async findVectorSearch(embedding: number[]): Promise<FaqEntity[]> {
    const start = Date.now();
    const query: MongoQueryOptionsDto = {
      vectorSearch: {
        index: this.embeddingsIndex,
        path: this.embeddingsField,
        queryVector: embedding,
        k: this.embeddingsResult,
        numCandidates: this.embeddingsCandidates,
        limit: this.embeddingsLimit,
      },
      limit: this.embeddingsLimit,
      maxTimeMS: this.maxTimeMS,
    }
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { operation: 'findVectorSearch', collection: this.collection, query },
    };
    this.logger.log('START Select Mongo', logData);
    const results: FaqEntity[] = await this.findWithOptions(query);
    console.dir(results);
    this.logger.log('END Select Mongo', {
      ...logData,
      response: results,
      processingTime: `${Date.now() - start}ms`,
    });
    return results;
  }

  /**
   * Transforma un documento Mongoose en una entidad del dominio.
   * @param doc Documento de MongoDB
   * @returns Entidad FaqEntity
   */
  protected mapToEntity(doc: Faq & Document): FaqEntity {
    return new FaqEntity({
      id: (doc._id as Types.ObjectId).toHexString(),
      question: doc.question,
      answer: doc.answer,
      embedding: [],
    });
  }

  /**
   * Inserta una nueva pregunta frecuente en MongoDB.
   * Registra logs con tiempo de ejecución y datos relacionados.
   * @param data Objeto con la pregunta y respuesta
   * @returns Entidad FaqEntity creada
   */
  async createFaq(data: { question: string; answer: string; embedding: number[]; }): Promise<FaqEntity> {
    const start = Date.now();
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { collection: this.collection, data },
    };
    this.logger.log('START Insert Mongo', logData);
    const created = await this.create(data);
    this.logger.log('END Insert Mongo', {
      ...logData,
      response: created,
      processingTime: `${Date.now() - start}ms`,
    });
    return created;
  }

  /**
  * Busca preguntas frecuentes que coincidan con la pregunta.
  * @param question pregunta a buscar
  * @returns Lista de FAQs encontradas
  */
  async findByQuestion(question: string): Promise<FaqEntity[]> {
    const start = Date.now();
    const query: MongoQueryOptionsDto = {
      filter: { question },
      limit: 1,
      maxTimeMS: this.maxTimeMS,
    }
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { operation: 'findByQuestion', collection: this.collection, query },
    };
    this.logger.log('START Select Mongo', logData);
    const results = await this.findWithOptions(query);
    this.logger.log('END Select Mongo', {
      ...logData,
      response: results,
      processingTime: `${Date.now() - start}ms`,
    });
    return results;
  }
}
