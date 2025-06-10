/**
 * Objeto de configuración para búsquedas avanzadas en MongoDB
 */
export class MongoQueryOptionsDto {
  /**
   * Filtro de búsqueda (equivale al primer argumento de .find())
   */
  filter?: Record<string, any> = {};

  /**
   * Número de página para paginación (por defecto: 1)
   */
  page?: number = 1;

  /**
   * Cantidad de documentos por página (por defecto: 10)
   */
  limit?: number = 10;

  /**
   * Campos a proyectar (equivale al segundo argumento de .find())
   */
  projection?: Record<string, any> = {};

  /**
   * Ordenamiento (por ejemplo: { createdAt: -1 })
   */
  sort?: Record<string, 1 | -1> = {};
  
  /**
   * Tiempo máximo en milisegundos que el servidor puede tardar en ejecutar la consulta
   */
  maxTimeMS?: number = 5000;

  /**
   * Configuración de búsqueda vectorial para consultas avanzadas
   */
  vectorSearch?: {
    index: string; //Nombre del índice vectorial en MongoDB Atlas
    path: string; //Campo dentro de la colección que almacena los embeddings
    queryVector: number[]; //Vector de consulta, usado para encontrar similitudes en la base de datos
    k: number; //Cantidad de resultados más similares que se deben devolver
    numCandidates:number; //Número inicial de candidatos considerados antes de elegir los k más cercanos
    limit:number; //Límite final de resultados a retornar (puede ser redundante con k) para evitar error "PlanExecutor error during aggregation :: caused by :: \"limit\" is required"
  };
}
