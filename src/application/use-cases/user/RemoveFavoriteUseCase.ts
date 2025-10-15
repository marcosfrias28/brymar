import { IUserFavoriteRepository } from '@/domain/user/repositories/IUserFavoriteRepository';
import { UserId } from '@/domain/user/value-objects/UserId';
import { RemoveFavoriteInput } from '@/application/dto/user/RemoveFavoriteInput';
import { RemoveFavoriteOutput } from '@/application/dto/user/RemoveFavoriteOutput';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';
import { UseCaseExecutionError } from '@/application/errors/ApplicationError';

export class RemoveFavoriteUseCase {
    constructor(
        private readonly userFavoriteRepository: IUserFavoriteRepository
    ) { }

    async execute(input: RemoveFavoriteInput): Promise<RemoveFavoriteOutput> {
        try {
            const userId = UserId.create(input.getUserId());
            const favoriteId = parseInt(input.getFavoriteId());

            // Find the favorite to ensure it exists and belongs to the user
            const favorite = await this.userFavoriteRepository.findById(favoriteId);

            if (!favorite) {
                throw new EntityNotFoundError('UserFavorite', input.getFavoriteId());
            }

            // Verify the favorite belongs to the requesting user
            if (!favorite.belongsToUser(userId)) {
                throw new BusinessRuleViolationError('Unauthorized: Favorite does not belong to user', 'UNAUTHORIZED_FAVORITE_ACCESS');
            }

            // Remove the favorite
            await this.userFavoriteRepository.delete(favoriteId);

            return RemoveFavoriteOutput.success(
                input.getFavoriteId(),
                'Favorite removed successfully'
            );

        } catch (error) {
            if (error instanceof EntityNotFoundError || error instanceof BusinessRuleViolationError) {
                throw error;
            }

            console.error('Remove favorite error:', error);
            throw new UseCaseExecutionError('Failed to remove favorite', 'RemoveFavoriteUseCase', error as Error);
        }
    }
}