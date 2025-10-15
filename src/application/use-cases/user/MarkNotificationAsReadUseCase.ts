import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { UserId } from '@/domain/user/value-objects/UserId';
import { MarkNotificationAsReadInput } from '@/application/dto/user/MarkNotificationAsReadInput';
import { MarkNotificationAsReadOutput } from '@/application/dto/user/MarkNotificationAsReadOutput';
import { EntityNotFoundError } from '@/domain/shared/errors/DomainError';
import { UseCaseExecutionError } from '@/application/errors/ApplicationError';

export class MarkNotificationAsReadUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: MarkNotificationAsReadInput): Promise<MarkNotificationAsReadOutput> {
        try {
            const userId = UserId.create(input.getUserId());
            const notificationId = input.getNotificationId();

            // Find the user to ensure they exist
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new EntityNotFoundError('User', input.getUserId());
            }

            // Since we don't have a dedicated notifications table,
            // this is a placeholder implementation that simulates marking as read
            // In a real implementation, you would:
            // 1. Find the notification by ID
            // 2. Verify it belongs to the user
            // 3. Mark it as read in the database

            // For now, we'll just return success
            return MarkNotificationAsReadOutput.success(
                notificationId,
                'Notification marked as read successfully'
            );

        } catch (error) {
            if (error instanceof EntityNotFoundError || error instanceof UseCaseExecutionError) {
                throw error;
            }

            console.error('Mark notification as read error:', error);
            throw new UseCaseExecutionError('Failed to mark notification as read', 'MarkNotificationAsReadUseCase', error as Error);
        }
    }
}