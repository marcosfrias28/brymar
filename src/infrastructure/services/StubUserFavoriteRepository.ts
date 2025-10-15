import { IUserFavoriteRepository } from '@/domain/user/repositories/IUserFavoriteRepository';
import { UserFavorite } from '@/domain/user/entities/UserFavorite';
import { UserId } from '@/domain/user/value-objects/UserId';

/**
 * Stub implementation of UserFavoriteRepository for development/testing
 * This should be replaced with a proper Drizzle implementation
 */
export class StubUserFavoriteRepository implements IUserFavoriteRepository {
    private favorites: Map<number, UserFavorite> = new Map();
    private nextId = 1;

    async save(favorite: UserFavorite): Promise<void> {
        const id = favorite.getId() || this.nextId++;
        // Create a new favorite with the proper ID
        const favoriteData = {
            id,
            userId: favorite.getUserId(),
            itemType: favorite.getItemType(),
            propertyId: favorite.getPropertyId(),
            landId: favorite.getLandId(),
            createdAt: new Date()
        };

        const newFavorite = UserFavorite.reconstitute(favoriteData);
        this.favorites.set(id, newFavorite);
    }

    async findById(id: number): Promise<UserFavorite | null> {
        return this.favorites.get(id) || null;
    }

    async findByUserId(userId: UserId): Promise<UserFavorite[]> {
        return Array.from(this.favorites.values()).filter(
            favorite => favorite.getUserId().equals(userId)
        );
    }

    async findByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<UserFavorite | null> {
        return Array.from(this.favorites.values()).find(favorite =>
            favorite.getUserId().equals(userId) &&
            favorite.getItemType() === itemType &&
            favorite.getItemId() === itemId
        ) || null;
    }

    async findPropertyFavoritesByUserId(userId: UserId): Promise<UserFavorite[]> {
        return Array.from(this.favorites.values()).filter(
            favorite => favorite.getUserId().equals(userId) && favorite.isPropertyFavorite()
        );
    }

    async findLandFavoritesByUserId(userId: UserId): Promise<UserFavorite[]> {
        return Array.from(this.favorites.values()).filter(
            favorite => favorite.getUserId().equals(userId) && favorite.isLandFavorite()
        );
    }

    async existsByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<boolean> {
        const favorite = await this.findByUserAndItem(userId, itemType, itemId);
        return favorite !== null;
    }

    async delete(id: number): Promise<void> {
        this.favorites.delete(id);
    }

    async deleteByUserAndItem(
        userId: UserId,
        itemType: 'property' | 'land',
        itemId: number
    ): Promise<void> {
        const favorite = await this.findByUserAndItem(userId, itemType, itemId);
        if (favorite) {
            await this.delete(favorite.getId());
        }
    }

    async deleteAllByUserId(userId: UserId): Promise<void> {
        const userFavorites = await this.findByUserId(userId);
        for (const favorite of userFavorites) {
            await this.delete(favorite.getId());
        }
    }

    async countByUserId(userId: UserId): Promise<number> {
        const favorites = await this.findByUserId(userId);
        return favorites.length;
    }

    async countPropertyFavoritesByUserId(userId: UserId): Promise<number> {
        const favorites = await this.findPropertyFavoritesByUserId(userId);
        return favorites.length;
    }

    async countLandFavoritesByUserId(userId: UserId): Promise<number> {
        const favorites = await this.findLandFavoritesByUserId(userId);
        return favorites.length;
    }
}