/**
 * Output DTO for password reset
 */
export class ResetPasswordOutput {
    private constructor(
        public readonly success: boolean,
        public readonly message: string,
        public readonly passwordReset: boolean
    ) { }

    /**
     * Creates a successful password reset output
     */
    static success(message: string = 'Password has been reset successfully'): ResetPasswordOutput {
        return new ResetPasswordOutput(true, message, true);
    }

    /**
     * Creates a failed password reset output
     */
    static failure(message: string = 'Failed to reset password'): ResetPasswordOutput {
        return new ResetPasswordOutput(false, message, false);
    }

    /**
     * Creates output for invalid or expired token
     */
    static invalidToken(message: string = 'Invalid or expired reset token'): ResetPasswordOutput {
        return new ResetPasswordOutput(false, message, false);
    }
}