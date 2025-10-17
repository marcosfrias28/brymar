import { EntityId } from '../value-objects/EntityId';

export interface SearchCriteria {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    hasMore: boolean;
    totalPages?: number;
    currentPage?: number;
}

export interface BaseRepository<TEntity, TId extends EntityId> {
    /**
     * Find entity by ID
     */
    findById(id: TId): Promise<TEntity | null>;

    /**
     * Save entity (create or update)
     */
    save(entity: TEntity): Promise<void>;

    /**
     * Delete entity by ID
     */
    delete(id: TId): Promise<void>;

    /**
     * Check if entity exists
     */
    exists(id: TId): Promise<boolean>;

    /**
     * Count entities matching criteria
     */
    count(criteria?: Partial<SearchCriteria>): Promise<number>;

    /**
     * Find all entities with pagination
     */
    findAll(criteria?: SearchCriteria): Promise<SearchResult<TEntity>>;
}

export interface StatusFilterableRepository<TEntity, TId extends EntityId, TStatus>
    extends BaseRepository<TEntity, TId> {
    /**
     * Find entities by status
     */
    findByStatus(status: TStatus): Promise<TEntity[]>;

    /**
     * Count entities by status
     */
    countByStatus(status: TStatus): Promise<number>;
}

export interface SearchableRepository<TEntity, TId extends EntityId, TSearchCriteria extends SearchCriteria>
    extends BaseRepository<TEntity, TId> {
    /**
     * Search entities with criteria
     */
    search(criteria: TSearchCriteria): Promise<SearchResult<TEntity>>;

    /**
     * Find published/public entities
     */
    findPublished(criteria?: SearchCriteria): Promise<SearchResult<TEntity>>;

    /**
     * Find featured entities
     */
    findFeatured(limit?: number): Promise<TEntity[]>;

    /**
     * Find recent entities
     */
    findRecent(limit?: number): Promise<TEntity[]>;
}

export interface LocationFilterableRepository<TEntity, TId extends EntityId>
    extends BaseRepository<TEntity, TId> {
    /**
     * Find entities by location
     */
    findByLocation(location: string): Promise<TEntity[]>;

    /**
     * Find entities near coordinates
     */
    findNearLocation(latitude: number, longitude: number, radiusKm: number): Promise<TEntity[]>;
}

export interface PriceFilterableRepository<TEntity, TId extends EntityId>
    extends BaseRepository<TEntity, TId> {
    /**
     * Find entities within price range
     */
    findByPriceRange(minPrice: number, maxPrice: number): Promise<TEntity[]>;

    /**
     * Get price statistics
     */
    getPriceStatistics(location?: string): Promise<{
        averagePrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
        totalItems: number;
    }>;
}