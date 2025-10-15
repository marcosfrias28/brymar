export class DeleteBlogPostOutput {
    constructor(
        public readonly id: string,
        public readonly success: boolean,
        public readonly message: string
    ) { }

    static success(id: string): DeleteBlogPostOutput {
        return new DeleteBlogPostOutput(
            id,
            true,
            'Blog post deleted successfully'
        );
    }

    static failure(id: string, message: string): DeleteBlogPostOutput {
        return new DeleteBlogPostOutput(
            id,
            false,
            message
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    isSuccess(): boolean {
        return this.success;
    }

    getMessage(): string {
        return this.message;
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            success: this.success,
            message: this.message,
        });
    }
}