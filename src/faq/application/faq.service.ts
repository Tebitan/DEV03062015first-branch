import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoService } from '../infrastructure/mongo/mongo.service';
import { ClientRestService } from '../infrastructure/http/rest/client-rest.service';
import { CreateFaqDto, FindFaqByQuestionDto } from '../domain/dto';
import { FaqEntity } from '../domain/entities/faq.entity';
import { BusinessExceptionDto } from '../../shared/domain/business-exceptions.dto';
import {
  CODE_200,
  CODE_400,
  LEGACY,
  LEGACY_IA,
  LEGACY_MONGODB,
  MSG_200,
  MSG_400,
} from '../../shared/constants/constants';
import { removeAccents } from '../../shared/utils/common-utils';
import { ApiResponseDto } from '../../shared/domain/api-response.dto';
import { HttpResponse } from '../../shared/domain/http-client-options.dto';
import { Embedding } from '../infrastructure/http/rest/dto/rest.dto';

/**
 * Servicio encargado de la lógica de negocio para el manejo de preguntas frecuentes (FAQ).
 * 
 * Este servicio permite crear nuevas preguntas frecuentes, validando previamente que no se
 * repitan preguntas ya existentes. También interactúa con el repositorio de Mongo para
 * realizar las operaciones de persistencia.
 * 
 * Características:
 * - Verifica duplicados antes de crear un nuevo FAQ.
 * - Permite configurar el tiempo máximo de espera (`maxTimeMS`) desde variables de entorno.
 * - Lanza excepciones de negocio personalizadas en caso de errores.
 * 
 * Variables de entorno utilizadas:
 * - `MONGO_MAX_TIME_MS`: Tiempo máximo de ejecución para consultas Mongo (en milisegundos).
 * 
 * Dependencias:
 * - `MongoService`: Implementación del repositorio Mongo para FAQs.
 * - `ConfigService`: Servicio para acceder a variables de entorno.
 * - `ClientRestService`: Cliente de HTTP Rest.
 */
@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('TransactionId') private readonly transactionId: string,
    private readonly mongoService: MongoService,
    private readonly clientRestService: ClientRestService,
  ) { }

  /**
   * createFaq
   * @description Realiza la creación de preguntas frecuentes
   * @param createFaqDto Request recibido
   * @param transactionId Identificador de la transacción
   * @returns ApiResponseDto
   */
  public async createFaq(createFaqDto: CreateFaqDto): Promise<ApiResponseDto> {
    try {
      const { question } = createFaqDto;
      await this.validateIfQuestionExists(question);
      const responseLegacy: HttpResponse<Embedding> = await this.generateEmbedding(question);
      await this.validateResponseLegacy(responseLegacy);
      const newFaq: FaqEntity = await this.saveFaq(createFaqDto, responseLegacy.data.data[0].embedding);
      return new ApiResponseDto({
        responseCode: HttpStatus.OK,
        messageCode: CODE_200,
        message: MSG_200,
        legacy: LEGACY,
        transactionId: this.transactionId,
        data: newFaq,
      });
    } catch (error) {
      if (error instanceof BusinessExceptionDto) throw error;
      this.logger.error(error.message, { transactionId: this.transactionId, stack: error.stack });
      throw new BusinessExceptionDto({
        legacy: LEGACY_MONGODB,
        transactionId: this.transactionId,
        data: { message: error.message },
      });
    }
  }

  /**
   * findFaqByQestion
   * @description Realiza la busqueda por pregunta unsado una busqueda vectorial por embeddin
   * @param findFaqByQuestionDto Request recibido 
   * @returns ApiResponseDto
   */
  public async findFaqByQestion(findFaqByQuestionDto: FindFaqByQuestionDto): Promise<ApiResponseDto> {
    try {
      const { question } = findFaqByQuestionDto;
      const responseLegacy: HttpResponse<Embedding> = await this.generateEmbedding(question);
      await this.validateResponseLegacy(responseLegacy);
      const embedding: number[] = responseLegacy.data.data[0].embedding;
      const faqs:FaqEntity[] = await this.searchFaqByEmbedding(embedding);   
      return new ApiResponseDto({
        responseCode: HttpStatus.OK,
        messageCode: CODE_200,
        message: MSG_200,
        legacy: LEGACY,
        transactionId: this.transactionId,
        data: faqs,
      });
    } catch (error) {
      if (error instanceof BusinessExceptionDto) throw error;
      this.logger.error(error.message, { transactionId: this.transactionId, stack: error.stack });
      throw new BusinessExceptionDto({
        legacy: LEGACY_MONGODB,
        transactionId: this.transactionId,
        data: { message: error.message },
      });
    }
  }

  /**
   * searchFaqByEmbedding
   * @description Realiza la busqueda por Embedding
   * @param embedding Dato embedding
   * @returns FaqEntity[]
   */
  public async searchFaqByEmbedding(embedding: number[]): Promise<FaqEntity[]> {
    return this.mongoService.findVectorSearch(embedding);
  }

  /**
   * saveFaq
   * @description Inserta una nueva FAQ en la base de datos
   * @param createFaqDto Datos de la FAQ
   * @param embedding Dato embedding
   * @param transactionId Identificador de la transacción
   * @returns FaqEntity
   */
  public async saveFaq(createFaqDto: CreateFaqDto, embedding: number[]): Promise<FaqEntity> {
    return this.mongoService.createFaq({ ...createFaqDto, embedding });
  }

  /**
   * validateIfQuestionExists
   * @description Verifica si ya existe una pregunta similar en la base de datos
   * @param question Pregunta a verificar
   * @param transactionId Identificador de la transacción
   * @throws BusinessException si la pregunta ya existe
   */
  public async validateIfQuestionExists(question: string): Promise<void> {
    const normalizedQuestion = removeAccents(question.trim().toLowerCase());
    const existing = await this.mongoService.findByQuestion(normalizedQuestion);
    if (existing && existing.length > 0) {
      this.throwBusinessError({
        legacy: LEGACY_MONGODB,
        messageCode: 'FAQ_DUPLICATE_QUESTION',
        message: 'Ya existe un FAQ con la pregunta proporcionada.',
        additionalData: { question },
      });
    }
  }

  /**
   * Realiza la validacion de la respuesta del legado externo code http 200
   * @param responseLegacy Respuesta del legado
   */
  public async validateResponseLegacy(responseLegacy: HttpResponse<Embedding>): Promise<void> {
    if (responseLegacy.status !== HttpStatus.OK) {
      this.throwBusinessError({
        legacy: LEGACY_IA,
        messageCode: 'EMBEDDING_GENERATION_FAILED',
        message: 'Error generando embedding desde el proveedor externo.',
        additionalData: { responseLegacy },
      });
    }
    if (!this.isValidEmbeddingResponse(responseLegacy)) {
      this.throwBusinessError({
        legacy: LEGACY_IA,
        messageCode: 'INVALID_EMBEDDING_RESPONSE',
        message: 'La respuesta del proveedor no contiene un embedding válido.',
        additionalData: { responseLegacy },
      });
    }
  }

  /**
   * Realiza la generacion de Embedding
   * @param input El dato a transformar 
   * @returns HttpResponse<any>
   */
  public async generateEmbedding(input: string): Promise<HttpResponse<any>> {
    return this.clientRestService.postEmbedding(input);
  }

  /**
   * Realiza la validacion de la respuesta del legado
   * @param responseLegacy Respuesta del legado 
   * @returns 'True' o 'False'
   */
  public isValidEmbeddingResponse(responseLegacy: HttpResponse<Embedding>): boolean {
    const dataList = responseLegacy?.data?.data;
    if (!Array.isArray(dataList) || dataList.length === 0) return false;
    const embedding = dataList[0]?.embedding;
    return (
      Array.isArray(embedding) &&
      embedding.length > 0 &&
      embedding.every((value) => typeof value === 'number')
    );
  }

  /**
   * Lanza una excepción de negocio personalizada.
   * @param params Objeto de Exception Comun
   */
  public throwBusinessError(params: {
    legacy: string;
    messageCode: string;
    message: string;
    additionalData?: Record<string, any>;
  }): never {
    const { legacy, messageCode, message, additionalData } = params;
    throw new BusinessExceptionDto({
      responseCode: HttpStatus.BAD_REQUEST,
      messageCode: CODE_400,
      message: MSG_400,
      legacy,
      transactionId: this.transactionId,
      data: {
        message,
        messageCode,
        ...additionalData,
      },
    });
  }
}
