import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { Email } from '@/domain/shared/value-objects/Email';
import { ForgotPasswordInput } from '../../dto/user/ForgotPasswordInput';
import { ForgotPasswordOutput } from '../../dto/user/ForgotPasswordOutput';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

// This would typically be injected as a service interface
interface IPasswordResetService {
    generateResetToken(userId: string): Promise<string>;
    sendResetEmail(email: string, token: string, redirectUrl?: string): Promise<void>;
}

/**
 * Use case for handling forgot password requests
 */
export class ForgotPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordResetService: IPasswordResetService
    ) { }

    /**
     * Executes the forgot password use case
     */
    async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
        try {
            // 1. Find user by email
            const email = Email.create(input.email);
            const user = await this.userRepository.findByEmail(email);

            // 2. For security reasons, we don't reveal if the email exists or not
            if (!user) {
                // Return success message but don't actually send email
                return ForgotPasswordOutput.emailNotFound();
            }

            // 3. Validate user can reset password
            if (!user.getStatus().isActive()) {
                // Still return success for security, but don't send email
                return ForgotPasswordOutput.emailNotFound();
            }

            if (user.getStatus().isSuspended()) {
                // Still return success for security, but don't send email
                return ForgotPasswordOutput.emailNotFound();
            }

            // 4. Generate reset token
            const resetToken = await this.passwordResetService.generateResetToken(user.getId().value);

            // 5. Send reset email
            await this.passwordResetService.sendResetEmail(
                input.email,
                resetToken,
                input.redirectUrl
            );

            // 6. Return success response
            return ForgotPasswordOutput.success();

        } catch (error) {
            console.error('Forgot password error:', error);

            // For security reasons, we still return success even if there's an error
            // The actual error is logged for debugging
            return ForgotPasswordOutput.success();
        }
    }

    /**
     * Validates if user can request password reset
     */
    private validatePasswordResetRequest(email: string): void {
        if (!email || email.trim().length === 0) {
            throw new BusinessRuleViolationError('Email is required', 'EMAIL_REQUIRED');
        }

        // Additional validation could be added here
        // For example, rate limiting checks
    }
}