export interface BaseRepository<TEntity, ID = string> {
    /**
     * Crea una nueva entidad.
     * @param data Datos para la creación
     */
    create(data: Partial<TEntity>): Promise<TEntity>;

    /**
     * Obtiene todas las entidades.
     */
    findAll(): Promise<TEntity[]>;

    /**
     * Busca una entidad por ID.
     * @param id Identificador único
     */
    findById(id: ID): Promise<TEntity | null>;

    /**
     * Actualiza una entidad por ID.
     * @param id Identificador único
     * @param data Datos a actualizar
     */
    update(id: ID, data: Partial<TEntity>): Promise<TEntity | null>;

    /**
     * Elimina una entidad por ID.
     * @param id Identificador único
     */
    delete(id: ID): Promise<boolean>;

    /**
     * Búsqueda por campo con coincidencia parcial (regex, case-insensitive)
     * @param field Campo por buscar
     * @param value Valor por Buscar
     */
    findByField?<K extends keyof TEntity>(field: keyof TEntity, value: string): Promise<TEntity[]>;
}
