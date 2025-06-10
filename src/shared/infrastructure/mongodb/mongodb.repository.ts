import { Model, Document, UpdateQuery } from 'mongoose';
import { MongoQueryOptionsDto } from '../../domain/mongo-query-options.dto';
import { BaseRepository } from './interfaces/base-repository.interface';

/**
 * Clase base abstracta para repositorios MongoDB.
 * Implementa operaciones comunes y reutilizables usando Mongoose.
 *
 * @template TModel - Tipo del modelo de Mongoose (schema).
 * @template TEntity - Tipo de la entidad del dominio.
 */
export abstract class MongoRepository<TModel, TEntity> implements BaseRepository<TEntity> {

  /**
   * Constructor del repositorio
   * @param model Modelo de Mongoose inyectado
   */
  constructor(protected readonly model: Model<TModel & Document>) { }

  /**
   * Crea un nuevo documento en MongoDB
   * 
   * @param data Datos parciales del modelo
   * @returns Entidad creada
   */
  async create(data: Partial<TEntity>): Promise<TEntity> {
    const created = await this.model.create(data);
    return this.mapToEntity(created);
  }

  /**
   * Obtiene todos los documentos sin filtros
   * 
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms)
   * @returns Lista de entidades
   */
  async findAll(maxTimeMS = 5000): Promise<TEntity[]> {
    const docs = await this.model.find().maxTimeMS(maxTimeMS);
    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Busca documentos por un campo usando expresión regular (case-insensitive)
   * 
   * @param field Campo del modelo por el cual filtrar
   * @param value Valor a buscar
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms)
   * @returns Lista de entidades encontradas
   */
  async findByField(field: keyof TEntity, value: string, maxTimeMS = 5000): Promise<TEntity[]> {
    const docs = await this.model
      .find({
        [field]: { $regex: value, $options: 'i' },
      } as any)
      .maxTimeMS(maxTimeMS);
    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Busca documentos con múltiples opciones avanzadas (filtro, paginación, proyección, etc.)
   * 
   * @param options Objeto de configuración para búsqueda avanzada
   * @returns Lista de entidades encontradas
   */
  async findWithOptions(options: MongoQueryOptionsDto): Promise<TEntity[]> {
    const {
      filter = {},
      page = 1,
      limit = 10,
      projection = {},
      sort = {},
      maxTimeMS = 5000,
      vectorSearch,
    } = options;
    const aggregationPipeline: any[] = [];
    if (vectorSearch) {
      aggregationPipeline.push({
        $vectorSearch: { ...vectorSearch },
      });
    }
    if (Object.keys(sort).length > 0) {
      aggregationPipeline.push({ $sort: sort });
    }
    if (projection && Object.keys(projection).length > 0) {
      aggregationPipeline.push({ $project: projection });
    }
    aggregationPipeline.push({ $match: filter });
    aggregationPipeline.push({ $limit: limit });
    aggregationPipeline.push({ $skip: (page - 1) * limit });
    const docs = await this.model.aggregate(aggregationPipeline, { maxTimeMS });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Busca documentos por ID
   * 
   * @param id ID del documento
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms) 
   * @returns Entida Encontrada
   */
  async findById(id: string, maxTimeMS = 5000): Promise<TEntity> {
    const doc = await this.model.findById(id).maxTimeMS(5000);
    return doc ? this.mapToEntity(doc) : null;
  }

  /**
   * Actualiza el documento en MongoDB
   * 
   * @param id ID del documento
   * @param data Datos parciales del modelo
   * @returns Entidad actualizada
   */
  async update(id: string, data: Partial<TEntity>, maxTimeMS = 5000): Promise<TEntity | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, data as UpdateQuery<TModel & Document>, { new: true })
      .maxTimeMS(maxTimeMS);
    return updated ? this.mapToEntity(updated) : null;
  }

  /**
   * Elimina un documento por su ID en MongoDB.
   *
   * @param id ID del documento a eliminar
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms)
   * @returns true si se eliminó al menos un documento, false si no se encontró el ID
   */
  async delete(id: string, maxTimeMS = 5000): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).maxTimeMS(maxTimeMS);
    return result !== null;
  }


  /**
   * Método abstracto que transforma un documento de Mongo en una entidad del dominio
   * @param doc Documento de Mongoose
   * @returns Entidad del dominio
   */
  protected abstract mapToEntity(doc: TModel & Document): TEntity;
}
