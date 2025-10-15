import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { ResetPasswordInput } from '../../dto/user/ResetPasswordInput';
import { ResetPasswordOutput } from '../../dto/user/ResetPasswordOutput';
import { BusinessRuleViolationError, EntityNotFoundError } from '@/domain/shared/errors/DomainError';

// This would typically be injected as a service interface
interface IPasswordResetService {
    validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; expired?: boolean }>;
    invalidateResetToken(token: string): Promise<void>;
}

interface IPasswordService {
    hash(password: string): Promise<string>;
    validatePasswordStrength(password: string): boolean;
}

/**
 * Use case for handling password reset
 */
export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordResetService: IPasswordResetService,
        private readonly passwordService: IPasswordService
    ) { }

    /**
     * Executes the password reset use case
     */
    async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
        try {
            // 1. Validate reset token
            const tokenValidation = await this.passwordResetService.validateResetToken(input.token);

            if (!tokenValidation.valid) {
                if (tokenValidation.expired) {
                    return ResetPasswordOutput.invalidToken('Reset token has expired. Please request a new password reset.');
                }
                return ResetPasswordOutput.invalidToken();
            }

            if (!tokenValidation.userId) {
                return ResetPasswordOutput.invalidToken();
            }

            // 2. Find user
            const user = await this.userRepository.findById({ value: tokenValidation.userId } as any);

            if (!user) {
                return ResetPasswordOutput.invalidToken();
            }

            // 3. Validate user can reset password
            if (!user.getStatus().isActive()) {
                throw new BusinessRuleViolationError('Cannot reset password for inactive user', 'USER_NOT_ACTIVE');
            }

            if (user.getStatus().isSuspended()) {
                throw new BusinessRuleViolationError('Cannot reset password for suspended user', 'USER_SUSPENDED');
            }

            // 4. Validate password strength
            if (!this.passwordService.validatePasswordStrength(input.password)) {
                throw new BusinessRuleViolationError('Password does not meet security requirements', 'WEAK_PASSWORD');
            }

            // 5. Hash new password
            const hashedPassword = await this.passwordService.hash(input.password);

            // 6. Update user password (this would be implemented in the User entity)
            // user.updatePassword(hashedPassword);

            // 7. Save updated user
            await this.userRepository.save(user);

            // 8. Invalidate the reset token
            await this.passwordResetService.invalidateResetToken(input.token);

            // 9. Return success response
            return ResetPasswordOutput.success();

        } catch (error) {
            if (error instanceof BusinessRuleViolationError) {
                return ResetPasswordOutput.failure(error.message);
            }

            console.error('Reset password error:', error);
            return ResetPasswordOutput.failure();
        }
    }

    /**
     * Validates password reset input
     */
    private validateInput(input: ResetPasswordInput): void {
        if (!input.token || input.token.trim().length === 0) {
            throw new BusinessRuleViolationError('Reset token is required', 'MISSING_RESET_TOKEN');
        }

        if (!input.password || input.password.length < 8) {
            throw new BusinessRuleViolationError('Password must be at least 8 characters long', 'PASSWORD_TOO_SHORT');
        }

        if (input.password !== input.confirmPassword) {
            throw new BusinessRuleViolationError('Passwords do not match', 'PASSWORD_MISMATCH');
        }
    }
}