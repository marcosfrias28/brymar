import { Entity } from '@/domain/shared/entities/Entity';
import { UserId } from '../value-objects/UserId';

export interface CreateUserFavoriteData {
    userId: string;
    itemType: 'property' | 'land';
    propertyId?: number;
    landId?: number;
}

export interface UserFavoriteData {
    id: number;
    userId: UserId;
    itemType: 'property' | 'land';
    propertyId?: number;
    landId?: number;
    createdAt: Date;
}

export class UserFavorite extends Entity {
    private constructor(
        id: number,
        private userId: UserId,
        private itemType: 'property' | 'land',
        private propertyId?: number,
        private landId?: number,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, createdAt || new Date(), updatedAt || new Date());
    }

    static create(data: CreateUserFavoriteData): UserFavorite {
        const userId = UserId.create(data.userId);

        // Validate that either propertyId or landId is provided based on itemType
        if (data.itemType === 'property' && !data.propertyId) {
            throw new Error('Property ID is required for property favorites');
        }
        if (data.itemType === 'land' && !data.landId) {
            throw new Error('Land ID is required for land favorites');
        }

        // Generate a temporary ID (will be replaced by database)
        const tempId = Math.floor(Math.random() * 1000000);

        return new UserFavorite(
            tempId,
            userId,
            data.itemType,
            data.propertyId,
            data.landId
        );
    }

    static reconstitute(data: UserFavoriteData): UserFavorite {
        return new UserFavorite(
            data.id,
            data.userId,
            data.itemType,
            data.propertyId,
            data.landId,
            data.createdAt,
            new Date()
        );
    }

    // Getters
    getId(): number {
        return this.id as number;
    }

    getUserId(): UserId {
        return this.userId;
    }

    getItemType(): 'property' | 'land' {
        return this.itemType;
    }

    getPropertyId(): number | undefined {
        return this.propertyId;
    }

    getLandId(): number | undefined {
        return this.landId;
    }

    getItemId(): number {
        return this.itemType === 'property' ? this.propertyId! : this.landId!;
    }

    // Business methods
    isPropertyFavorite(): boolean {
        return this.itemType === 'property';
    }

    isLandFavorite(): boolean {
        return this.itemType === 'land';
    }

    belongsToUser(userId: UserId): boolean {
        return this.userId.equals(userId);
    }
}