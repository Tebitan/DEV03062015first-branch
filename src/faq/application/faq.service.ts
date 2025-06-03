import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateFaqDto } from '../domain/dto';
import { MongoService } from '../infrastructure/mongo/impl/mongo.service';
import { FaqEntity } from '../domain/entities/faq.entity';
import { BusinessException } from '../../shared/resources/business-exceptions';
import {
  CODE_200,
  CODE_400,
  LEGACY,
  LEGACY_MONGODB,
  MSG_200,
  MSG_400,
} from '../../shared/resources/constants';
import { ApiResponseDto } from '../../shared/domain/apiResponse.dto';

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
 */
@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    @Inject('TransactionId') private readonly transactionId: string,
    private readonly mongoService: MongoService,
  ) { }

  /**
   * createFaq
   * @description Realiza la creación de preguntas frecuentes
   * @param createFaqDto Request recibido
   * @param transactionId Identificador de la transacción
   * @returns ApiResponseDto
   */
  public async createFaq(createFaqDto: CreateFaqDto): Promise<ApiResponseDto> {
    await this.validateIfQuestionExists(createFaqDto.question);
    try {
      const newFaq: FaqEntity = await this.saveFaq(createFaqDto);
      return new ApiResponseDto({
        responseCode: HttpStatus.OK,
        messageCode: CODE_200,
        message: MSG_200,
        legacy: LEGACY,
        transactionId: this.transactionId,
        data: newFaq,
      });
    } catch (error) {
      this.logger.error(error.message, { transactionId: this.transactionId, stack: error.stack });
      throw new BusinessException({
        legacy: LEGACY_MONGODB,
        transactionId: this.transactionId,
        data: { message: error.message },
      });
    }
  }

  /**
   * saveFaq
   * @description Inserta una nueva FAQ en la base de datos
   * @param createFaqDto Datos de la FAQ
   * @param transactionId Identificador de la transacción
   * @returns FaqEntity
   */
  public async saveFaq(createFaqDto: CreateFaqDto): Promise<FaqEntity> {
    return this.mongoService.create(createFaqDto);
  }

  /**
   * validateIfQuestionExists
   * @description Verifica si ya existe una pregunta similar en la base de datos
   * @param question Pregunta a verificar
   * @param transactionId Identificador de la transacción
   * @throws BusinessException si la pregunta ya existe
   */
  public async validateIfQuestionExists(question: string): Promise<void> {
    const normalizedQuestion = question.trim().toLowerCase();
    const existing = await this.mongoService.findWithOptions({
      filter: { question: normalizedQuestion },
      limit: 1,
    });
    if (existing && existing.length > 0) {
      throw new BusinessException({
        responseCode: HttpStatus.BAD_REQUEST,
        messageCode: CODE_400,
        message: MSG_400,
        legacy: LEGACY_MONGODB,
        data: {
          message: `Ya existe un FAQ con la pregunta proporcionada.`,
          messageCode: 'FAQ_DUPLICATE_QUESTION',
          question,
        },
        transactionId:this.transactionId
      });
    }
  }
}
