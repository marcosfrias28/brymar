/**
 * Output DTO for sending verification OTP
 */
export class SendVerificationOTPOutput {
    private constructor(
        public readonly success: boolean,
        public readonly message: string,
        public readonly otpSent: boolean,
        public readonly expiresAt?: Date
    ) { }

    /**
     * Creates a successful OTP send output
     */
    static success(
        expiresAt: Date,
        message: string = 'Verification code sent successfully'
    ): SendVerificationOTPOutput {
        return new SendVerificationOTPOutput(true, message, true, expiresAt);
    }

    /**
     * Creates a failed OTP send output
     */
    static failure(message: string = 'Failed to send verification code'): SendVerificationOTPOutput {
        return new SendVerificationOTPOutput(false, message, false);
    }

    /**
     * Creates output for rate limiting
     */
    static rateLimited(message: string = 'Too many requests. Please try again later'): SendVerificationOTPOutput {
        return new SendVerificationOTPOutput(false, message, false);
    }

    /**
     * Creates output for when email is not found (but we don't reveal this for security)
     */
    static emailNotFound(): SendVerificationOTPOutput {
        // For security reasons, we return the same message as success
        return new SendVerificationOTPOutput(true, 'Verification code sent successfully', false);
    }
}