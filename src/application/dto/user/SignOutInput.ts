/**
 * Input DTO for SignOutUseCase
 */
export class SignOutInput {
    private constructor(
        public readonly userId?: string
    ) { }

    static create(userId?: string): SignOutInput {
        return new SignOutInput(userId);
    }

    static anonymous(): SignOutInput {
        return new SignOutInput();
    }
}