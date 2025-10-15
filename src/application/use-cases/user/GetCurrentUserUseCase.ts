import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { UserId } from '@/domain/user/value-objects/UserId';
import { GetCurrentUserInput } from '@/application/dto/user/GetCurrentUserInput';
import { GetCurrentUserOutput } from '@/application/dto/user/GetCurrentUserOutput';
import { UseCaseExecutionError, ApplicationError } from '@/application/errors/ApplicationError';

/**
 * Use case for getting the current user's profile
 */
export class GetCurrentUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
        try {
            const userId = UserId.create(input.userId);
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new UseCaseExecutionError('User not found', 'GetCurrentUserUseCase');
            }

            return GetCurrentUserOutput.fromUser(user);
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                'Failed to get current user',
                'GetCurrentUserUseCase',
                error instanceof Error ? error : undefined
            );
        }
    }
}