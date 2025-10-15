/**
 * Output DTO for SignOutUseCase
 */
export class SignOutOutput {
    private constructor(
        public readonly success: boolean,
        public readonly message?: string
    ) { }

    static success(message?: string): SignOutOutput {
        return new SignOutOutput(true, message || 'Successfully signed out');
    }

    static failure(message: string): SignOutOutput {
        return new SignOutOutput(false, message);
    }
}