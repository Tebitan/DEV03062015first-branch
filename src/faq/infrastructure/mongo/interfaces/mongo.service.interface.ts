import { MongoQueryOptionsDto } from '../../../../shared/domain/mongo-query-options.dto';
import { FaqEntity } from '../../../domain/entities/faq.entity';

/**
 * Define el contrato para cualquier servicio que interactúe con MongoDB
 * (crear, buscar, filtrar, etc.)
 */
export interface IMongoService {
  /**
   * Crea una nueva entidad FAQ
   * @param data Objeto con la pregunta y respuesta
   */
  create(data: { question: string; answer: string; embedding: number[]; }): Promise<FaqEntity>;

  /**
   * Obtiene todas las FAQs
   * @param maxTimeMS Tiempo máximo de ejecución en milisegundos (opcional)
   */
  findAll(maxTimeMS?: number): Promise<FaqEntity[]>;

  /**
   * Busca FAQs por coincidencia en la pregunta
   * @param query Texto a buscar
   * @param maxTimeMS Tiempo máximo de ejecución en milisegundos (opcional)
   */
  findByQuestion(query: string, maxTimeMS?: number): Promise<FaqEntity[]>;

  /**
   * Búsqueda avanzada con filtros, paginación, proyección, etc.
   * @param options Opciones avanzadas de consulta
   */
  findWithOptions(options: MongoQueryOptionsDto): Promise<FaqEntity[]>;
}
