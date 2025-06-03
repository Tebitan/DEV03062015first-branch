import { Model, Document } from 'mongoose';
import { MongoDocuments } from '../../resources/mongo-documents.options';

/**
 * Clase base abstracta para repositorios MongoDB.
 * Implementa operaciones comunes y reutilizables usando Mongoose.
 *
 * @template TModel - Tipo del modelo de Mongoose (schema).
 * @template TEntity - Tipo de la entidad del dominio.
 */
export abstract class MongoRepository<TModel, TEntity> {
  /**
   * Constructor del repositorio
   * @param model Modelo de Mongoose inyectado
   */
  constructor(protected readonly model: Model<TModel & Document>) {}

  /**
   * Crea un nuevo documento en MongoDB
   * @param data Datos parciales del modelo
   * @returns Entidad creada
   */
  async create(data: Partial<TModel>): Promise<TEntity> {
    const created = await this.model.create(data);
    return this.mapToEntity(created);
  }

  /**
   * Obtiene todos los documentos sin filtros
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms)
   * @returns Lista de entidades
   */
  async findAll(maxTimeMS = 5000): Promise<TEntity[]> {
    const docs = await this.model.find().maxTimeMS(maxTimeMS);
    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Busca documentos por un campo usando expresión regular (case-insensitive)
   * @param field Campo del modelo por el cual filtrar
   * @param value Valor a buscar
   * @param maxTimeMS Tiempo máximo en milisegundos para la operación (default: 5000 ms)
   * @returns Lista de entidades encontradas
   */
  async findByField(field: keyof TModel, value: string, maxTimeMS = 5000): Promise<TEntity[]> {
    const docs = await this.model
      .find({
        [field]: { $regex: value, $options: 'i' },
      } as any)
      .maxTimeMS(maxTimeMS);
    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Busca documentos con múltiples opciones avanzadas (filtro, paginación, proyección, etc.)
   * @param options Objeto de configuración para búsqueda avanzada
   * @returns Lista de entidades encontradas
   */
  async findWithOptions(options: MongoDocuments): Promise<TEntity[]> {
    const {
      filter = {},
      page = 1,
      limit = 10,
      projection = {},
      sort = {},
      maxTimeMS = 5000,
    } = options;
    const skip = (page - 1) * limit;
    console.dir(options);
    const docs = await this.model
      .find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .maxTimeMS(maxTimeMS);

    return docs.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Método abstracto que transforma un documento de Mongo en una entidad del dominio
   * @param doc Documento de Mongoose
   * @returns Entidad del dominio
   */
  protected abstract mapToEntity(doc: TModel & Document): TEntity;
}
