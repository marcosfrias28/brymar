export interface RemoveFavoriteOutputData {
    success: boolean;
    favoriteId: string;
    message?: string;
}

export class RemoveFavoriteOutput {
    private constructor(private readonly data: RemoveFavoriteOutputData) { }

    static create(data: RemoveFavoriteOutputData): RemoveFavoriteOutput {
        return new RemoveFavoriteOutput(data);
    }

    static success(favoriteId: string, message?: string): RemoveFavoriteOutput {
        return new RemoveFavoriteOutput({
            success: true,
            favoriteId,
            message: message || 'Favorite removed successfully'
        });
    }

    static failure(favoriteId: string, message?: string): RemoveFavoriteOutput {
        return new RemoveFavoriteOutput({
            success: false,
            favoriteId,
            message: message || 'Failed to remove favorite'
        });
    }

    isSuccess(): boolean {
        return this.data.success;
    }

    getFavoriteId(): string {
        return this.data.favoriteId;
    }

    getMessage(): string | undefined {
        return this.data.message;
    }

    toData(): RemoveFavoriteOutputData {
        return { ...this.data };
    }
}