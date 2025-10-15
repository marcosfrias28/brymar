/**
 * Base repository interface for domain repositories
 */
export interface Repository<T, ID> {
    /**
     * Find entity by ID
     */
    findById(id: ID): Promise<T | null>;

    /**
     * Save entity
     */
    save(entity: T): Promise<void>;

    /**
     * Delete entity by ID
     */
    delete(id: ID): Promise<void>;

    /**
     * Check if entity exists by ID
     */
    exists(id: ID): Promise<boolean>;
}