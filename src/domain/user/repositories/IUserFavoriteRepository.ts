import { UserFavorite } from '../entities/UserFavorite';
import { UserId } from '../value-objects/UserId';

/**
 * Repository interface for UserFavorite aggregate
 */
export interface IUserFavoriteRepository {
    /**
     * Saves a user favorite (create or update)
     */
    save(favorite: UserFavorite): Promise<void>;

    /**
     * Finds a user favorite by ID
     */
    findById(id: number): Promise<UserFavorite | null>;

    /**
     * Finds all favorites for a user
     */
    findByUserId(userId: UserId): Promise<UserFavorite[]>;

    /**
     * Finds a specific favorite by user and item
     */
    findByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<UserFavorite | null>;

    /**
     * Finds all property favorites for a user
     */
    findPropertyFavoritesByUserId(userId: UserId): Promise<UserFavorite[]>;

    /**
     * Finds all land favorites for a user
     */
    findLandFavoritesByUserId(userId: UserId): Promise<UserFavorite[]>;

    /**
     * Checks if a user has favorited a specific item
     */
    existsByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<boolean>;

    /**
     * Removes a favorite by ID
     */
    delete(id: number): Promise<void>;

    /**
     * Removes a favorite by user and item
     */
    deleteByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<void>;

    /**
     * Removes all favorites for a user
     */
    deleteAllByUserId(userId: UserId): Promise<void>;

    /**
     * Counts favorites for a user
     */
    countByUserId(userId: UserId): Promise<number>;

    /**
     * Counts property favorites for a user
     */
    countPropertyFavoritesByUserId(userId: UserId): Promise<number>;

    /**
     * Counts land favorites for a user
     */
    countLandFavoritesByUserId(userId: UserId): Promise<number>;
}