import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { Email } from '@/domain/shared/value-objects/Email';
import { SendVerificationOTPInput } from '../../dto/user/SendVerificationOTPInput';
import { SendVerificationOTPOutput } from '../../dto/user/SendVerificationOTPOutput';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

// This would typically be injected as a service interface
interface IOTPService {
    generateOTP(email: string, purpose: string): Promise<{ otp: string; expiresAt: Date }>;
    sendOTPEmail(email: string, otp: string, purpose: string): Promise<void>;
    isRateLimited(email: string, purpose: string): Promise<boolean>;
}

/**
 * Use case for sending verification OTP
 */
export class SendVerificationOTPUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpService: IOTPService
    ) { }

    /**
     * Executes the send verification OTP use case
     */
    async execute(input: SendVerificationOTPInput): Promise<SendVerificationOTPOutput> {
        try {
            // 1. Check rate limiting
            const isRateLimited = await this.otpService.isRateLimited(input.email, input.purpose);
            if (isRateLimited) {
                return SendVerificationOTPOutput.rateLimited();
            }

            // 2. Find user by email
            const email = Email.create(input.email);
            const user = await this.userRepository.findByEmail(email);

            // 3. For security reasons, we don't reveal if the email exists or not
            if (!user) {
                // Return success message but don't actually send OTP
                return SendVerificationOTPOutput.emailNotFound();
            }

            // 4. Validate user can receive OTP based on purpose
            this.validateOTPRequest(user, input.purpose);

            // 5. Generate OTP
            const { otp, expiresAt } = await this.otpService.generateOTP(input.email, input.purpose);

            // 6. Send OTP email
            await this.otpService.sendOTPEmail(input.email, otp, input.purpose);

            // 7. Return success response
            return SendVerificationOTPOutput.success(expiresAt);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError) {
                return SendVerificationOTPOutput.failure(error.message);
            }

            console.error('Send verification OTP error:', error);

            // For security reasons, we still return success even if there's an error
            // The actual error is logged for debugging
            return SendVerificationOTPOutput.success(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes from now
        }
    }

    /**
     * Validates if user can receive OTP for the given purpose
     */
    private validateOTPRequest(user: any, purpose: string): void {
        switch (purpose) {
            case 'email_verification':
                if (user.getStatus().isVerified()) {
                    throw new BusinessRuleViolationError('Email is already verified', 'EMAIL_ALREADY_VERIFIED');
                }
                break;

            case 'password_reset':
                if (!user.getStatus().isActive()) {
                    throw new BusinessRuleViolationError('Cannot send OTP to inactive user', 'USER_INACTIVE');
                }
                if (user.getStatus().isSuspended()) {
                    throw new BusinessRuleViolationError('Cannot send OTP to suspended user', 'USER_SUSPENDED');
                }
                break;

            case 'two_factor':
                if (!user.getStatus().isActive()) {
                    throw new BusinessRuleViolationError('Cannot send OTP to inactive user', 'USER_INACTIVE');
                }
                if (!user.getStatus().isVerified()) {
                    throw new BusinessRuleViolationError('Email must be verified before enabling two-factor authentication', 'EMAIL_NOT_VERIFIED');
                }
                break;

            default:
                throw new BusinessRuleViolationError('Invalid OTP purpose', 'INVALID_OTP_PURPOSE');
        }
    }
}