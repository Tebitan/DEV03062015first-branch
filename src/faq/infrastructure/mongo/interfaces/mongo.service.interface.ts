import { FaqEntity } from '../../../domain/entities/faq.entity';

/**
 * Define el contrato para cualquier servicio que interactúe con MongoDB
 * (crear, buscar, filtrar, etc.)
 */
export interface IMongoService {
  /**
   * Crea una nueva entidad FAQ
   * @param data Objeto con la pregunta , respuesta y embedding Objecto generado por IA 
   */
  createFaq(data: { question: string; answer: string; embedding: number[]; }): Promise<FaqEntity>;

  /**
   * Realiza la busqueda por vectores
   * @param embedding Objecto generado por IA 
   * @returns Promise<FaqEntity[]>
   */
  findVectorSearch(embedding: number[]): Promise<FaqEntity[]>;

  /**
   * Busca FAQs por coincidencia en la pregunta
   * @param question pregunta por buscar 
   */
  findByQuestion(question: string): Promise<FaqEntity[]>;
}
