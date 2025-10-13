export class GenerateAIContentOutput {
    constructor(
        public readonly contentType: string,
        public readonly generatedContent: string,
        public readonly language: string,
        public readonly modelUsed: string,
        public readonly processingTimeMs: number,
        public readonly success: boolean,
        public readonly errorMessage?: string
    ) { }

    static success(data: {
        contentType: string;
        generatedContent: string;
        language: string;
        modelUsed: string;
        processingTimeMs: number;
    }): GenerateAIContentOutput {
        return new GenerateAIContentOutput(
            data.contentType,
            data.generatedContent,
            data.language,
            data.modelUsed,
            data.processingTimeMs,
            true
        );
    }

    static failure(data: {
        contentType: string;
        language: string;
        errorMessage: string;
        processingTimeMs?: number;
    }): GenerateAIContentOutput {
        return new GenerateAIContentOutput(
            data.contentType,
            "",
            data.language,
            "",
            data.processingTimeMs || 0,
            false,
            data.errorMessage
        );
    }

    toJSON(): Record<string, any> {
        return {
            contentType: this.contentType,
            generatedContent: this.generatedContent,
            language: this.language,
            modelUsed: this.modelUsed,
            processingTimeMs: this.processingTimeMs,
            success: this.success,
            errorMessage: this.errorMessage,
        };
    }
}