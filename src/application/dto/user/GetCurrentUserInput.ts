/**
 * Input DTO for GetCurrentUserUseCase
 */
export class GetCurrentUserInput {
    private constructor(
        public readonly userId: string
    ) { }

    static create(userId: string): GetCurrentUserInput {
        if (!userId || userId.trim() === '') {
            throw new Error('User ID is required');
        }

        return new GetCurrentUserInput(userId.trim());
    }

    static fromUserId(userId: string): GetCurrentUserInput {
        return GetCurrentUserInput.create(userId);
    }
}