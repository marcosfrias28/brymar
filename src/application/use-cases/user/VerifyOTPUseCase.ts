import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { Email } from '@/domain/shared/value-objects/Email';
import { VerifyOTPInput } from '../../dto/user/VerifyOTPInput';
import { VerifyOTPOutput } from '../../dto/user/VerifyOTPOutput';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

// This would typically be injected as a service interface
interface IOTPService {
    verifyOTP(email: string, otp: string, purpose: string): Promise<{
        valid: boolean;
        expired?: boolean;
        attemptsExceeded?: boolean;
    }>;
    invalidateOTP(email: string, purpose: string): Promise<void>;
}

interface ITokenService {
    generateVerificationToken(userId: string, purpose: string): Promise<string>;
}

/**
 * Use case for verifying OTP
 */
export class VerifyOTPUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpService: IOTPService,
        private readonly tokenService: ITokenService
    ) { }

    /**
     * Executes the verify OTP use case
     */
    async execute(input: VerifyOTPInput): Promise<VerifyOTPOutput> {
        try {
            // 1. Find user by email
            const email = Email.create(input.email);
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                return VerifyOTPOutput.failure('Invalid verification code');
            }

            // 2. Verify OTP
            const otpVerification = await this.otpService.verifyOTP(
                input.email,
                input.otp,
                input.purpose
            );

            if (!otpVerification.valid) {
                if (otpVerification.expired) {
                    return VerifyOTPOutput.expired();
                }
                if (otpVerification.attemptsExceeded) {
                    return VerifyOTPOutput.tooManyAttempts();
                }
                return VerifyOTPOutput.failure();
            }

            // 3. Process verification based on purpose
            let token: string | undefined;

            switch (input.purpose) {
                case 'email_verification':
                    // Mark user as verified
                    // user.markAsVerified();
                    await this.userRepository.save(user);
                    break;

                case 'password_reset':
                    // Generate password reset token
                    token = await this.tokenService.generateVerificationToken(
                        user.getId().value,
                        'password_reset'
                    );
                    break;

                case 'two_factor':
                    // Generate two-factor authentication token
                    token = await this.tokenService.generateVerificationToken(
                        user.getId().value,
                        'two_factor'
                    );
                    break;

                default:
                    throw new BusinessRuleViolationError('Invalid OTP purpose', 'INVALID_OTP_PURPOSE');
            }

            // 4. Invalidate the OTP
            await this.otpService.invalidateOTP(input.email, input.purpose);

            // 5. Return success response
            return VerifyOTPOutput.success(token);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError) {
                return VerifyOTPOutput.failure(error.message);
            }

            // Note: Verify OTP error occurred
            return VerifyOTPOutput.failure();
        }
    }

    /**
     * Validates OTP verification input
     */
    private validateInput(input: VerifyOTPInput): void {
        if (!input.email || input.email.trim().length === 0) {
            throw new BusinessRuleViolationError('Email is required', 'EMAIL_REQUIRED');
        }

        if (!input.otp || input.otp.trim().length === 0) {
            throw new BusinessRuleViolationError('OTP is required', 'MISSING_OTP');
        }

        if (!/^\d+$/.test(input.otp)) {
            throw new BusinessRuleViolationError('OTP must contain only numbers', 'INVALID_OTP_FORMAT');
        }

        if (input.otp.length < 4 || input.otp.length > 8) {
            throw new BusinessRuleViolationError('OTP must be between 4 and 8 digits', 'INVALID_OTP_LENGTH');
        }
    }
}