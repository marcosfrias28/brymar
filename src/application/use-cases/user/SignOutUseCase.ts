import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { UserId } from '@/domain/user/value-objects/UserId';
import { SignOutInput } from '@/application/dto/user/SignOutInput';
import { SignOutOutput } from '@/application/dto/user/SignOutOutput';
import { ApplicationError, UseCaseExecutionError } from '@/application/errors/ApplicationError';

/**
 * Use case for signing out a user
 */
export class SignOutUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: SignOutInput): Promise<SignOutOutput> {
        try {
            // In a real implementation, this would:
            // 1. Invalidate the user's session/token
            // 2. Clear any cached user data
            // 3. Log the sign-out event
            // 4. Update last activity timestamp

            if (input.userId) {
                const userId = UserId.create(input.userId);
                const user = await this.userRepository.findById(userId);

                if (user) {
                    // Update last activity or perform any cleanup
                    // For now, we'll just mark this as a successful sign-out
                }
            }

            return SignOutOutput.success();
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                'Failed to sign out user',
                'SignOutUseCase',
                error instanceof Error ? error : undefined
            );
        }
    }
}