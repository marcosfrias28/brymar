/**
 * Output DTO for OTP verification
 */
export class VerifyOTPOutput {
    private constructor(
        public readonly success: boolean,
        public readonly message: string,
        public readonly verified: boolean,
        public readonly token?: string
    ) { }

    /**
     * Creates a successful OTP verification output
     */
    static success(
        token?: string,
        message: string = 'Verification code verified successfully'
    ): VerifyOTPOutput {
        return new VerifyOTPOutput(true, message, true, token);
    }

    /**
     * Creates a failed OTP verification output
     */
    static failure(message: string = 'Invalid verification code'): VerifyOTPOutput {
        return new VerifyOTPOutput(false, message, false);
    }

    /**
     * Creates output for expired OTP
     */
    static expired(message: string = 'Verification code has expired'): VerifyOTPOutput {
        return new VerifyOTPOutput(false, message, false);
    }

    /**
     * Creates output for too many attempts
     */
    static tooManyAttempts(message: string = 'Too many verification attempts. Please request a new code'): VerifyOTPOutput {
        return new VerifyOTPOutput(false, message, false);
    }
}