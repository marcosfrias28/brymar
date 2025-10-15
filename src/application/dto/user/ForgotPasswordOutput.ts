/**
 * Output DTO for forgot password request
 */
export class ForgotPasswordOutput {
    private constructor(
        public readonly success: boolean,
        public readonly message: string,
        public readonly resetTokenSent: boolean
    ) { }

    /**
     * Creates a successful forgot password output
     */
    static success(message: string = 'Password reset instructions sent to your email'): ForgotPasswordOutput {
        return new ForgotPasswordOutput(true, message, true);
    }

    /**
     * Creates a failed forgot password output
     */
    static failure(message: string = 'Failed to process password reset request'): ForgotPasswordOutput {
        return new ForgotPasswordOutput(false, message, false);
    }

    /**
     * Creates output for when email is not found (but we don't reveal this for security)
     */
    static emailNotFound(): ForgotPasswordOutput {
        // For security reasons, we return the same message as success
        return new ForgotPasswordOutput(true, 'Password reset instructions sent to your email', false);
    }
}