import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { MongoRepository } from '../../../../shared/infrastructure/mongodb/mongodb.repository';
import { IMongoService } from '../mongo.service.interface';
import { Faq } from '../schema/faq.schema';
import { FaqEntity } from '../../../domain/entities/faq.entity';
import { ConfigService } from '@nestjs/config';
import { LEGACY_MONGODB } from '../../../../shared/resources/constants';
import { MongoDocuments } from '../../../../shared/resources/mongo-documents.options';

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

  constructor(
    @InjectModel(Faq.name) faqModel: Model<Faq & Document>,
    private readonly configService: ConfigService,
    @Inject('TransactionId') private readonly transactionId: string,
  ) {
    super(faqModel);
    this.collection = this.configService.get<string>('MONGO_FAQ_COLLECTION') ?? 'faq';
    this.maxTimeMS = this.configService.get<number>('MONGO_QUERY_TIMEOUT', 5000);
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
    });
  }

  /**
   * Inserta una nueva pregunta frecuente en MongoDB.
   * Registra logs con tiempo de ejecución y datos relacionados.
   * @param data Objeto con la pregunta y respuesta
   * @returns Entidad FaqEntity creada
   */
  async create(data: { question: string; answer: string }): Promise<FaqEntity> {
    const start = Date.now();
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { collection: this.collection, data },
    };
    this.logger.log('START Insert Mongo', logData);
    const created = await this.model.create(data);
    const result = this.mapToEntity(created);
    this.logger.log('END Insert Mongo', {
      ...logData,
      response: result,
      processingTime: `${Date.now() - start}ms`,
    });
    return result;
  }

  /**
  * Busca preguntas frecuentes que coincidan parcialmente con una cadena.
  * Utiliza expresiones regulares insensibles a mayúsculas/minúsculas.
  * @param query Texto a buscar
  * @param maxTimeMS Tiempo máximo de consulta en milisegundos
  * @returns Lista de FAQs encontradas
  */
  async findByQuestion(query: string): Promise<FaqEntity[]> {
    const start = Date.now();
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { operation: 'findByQuestion', collection: this.collection, query },
    };
    this.logger.log('START findByQuestion', logData);
    const results = await this.findByField('question', query, this.maxTimeMS);
    this.logger.log('END findByQuestion', {
      ...logData,
      response: results,
      processingTime: `${Date.now() - start}ms`,
    });
    return results;
  }

  /**
   * Obtiene todas las preguntas frecuentes.
   * @param maxTimeMS Tiempo máximo de ejecución en milisegundos
   * @returns Lista de FAQs
   */
  async findAll(): Promise<FaqEntity[]> {
    const start = Date.now();
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { operation: 'findAll', collection: this.collection },
    };
    this.logger.log('START findAll', logData);
    const docs = await this.model.find().maxTimeMS(this.maxTimeMS);
    const results = docs.map((doc) => this.mapToEntity(doc));
    this.logger.log('END findAll', {
      ...logData,
      response: results,
      processingTime: `${Date.now() - start}ms`,
    });
    return results;
  }

  /**
   * Realiza una búsqueda avanzada con filtros, paginación, ordenamiento, etc.
   * @param options Opciones de búsqueda avanzadas
   * @returns Lista de FAQs encontradas
   */
  async findWithOptions(options: MongoDocuments): Promise<FaqEntity[]> {
    const start = Date.now();
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY_MONGODB,
      request: { operation: 'findWithOptions', collection: this.collection, options },
    };
    this.logger.log('START findWithOptions', logData);
    const {
      filter = {},
      page = 1,
      limit = 10,
      projection = {},
      sort = {},
    } = options;
    const skip = (page - 1) * limit;
    const docs = await this.model
      .find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .maxTimeMS(this.maxTimeMS);
    const results = docs.map((doc) => this.mapToEntity(doc));
    this.logger.log('END findWithOptions', {
      ...logData,
      response: results,
      processingTime: `${Date.now() - start}ms`,
    });
    return results;
  }
}
