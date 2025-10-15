import { z } from "zod";
import {
    LanguageSchema
} from '@/domain/shared/schemas';

export class GenerateAIContentInput {
    constructor(
        public readonly wizardType: string,
        public readonly contentType: string,
        public readonly baseData: Record<string, any>,
        public readonly language: string = "es",
        public readonly userId?: string
    ) { }

    static create(data: {
        wizardType: string;
        contentType: string;
        baseData: Record<string, any>;
        language?: string;
        userId?: string;
    }): GenerateAIContentInput {
        const validated = GenerateAIContentInputSchema.parse(data);

        return new GenerateAIContentInput(
            validated.wizardType,
            validated.contentType,
            validated.baseData,
            validated.language,
            validated.userId
        );
    }

    static fromFormData(formData: FormData): GenerateAIContentInput {
        const data = {
            wizardType: formData.get("wizardType")?.toString() || "",
            contentType: formData.get("contentType")?.toString() || "",
            baseData: JSON.parse(formData.get("baseData")?.toString() || "{}"),
            language: formData.get("language")?.toString() || "es",
            userId: formData.get("userId")?.toString(),
        };

        return GenerateAIContentInput.create(data);
    }
}

const GenerateAIContentInputSchema = z.object({
    wizardType: z.enum(["property", "land", "blog"], {
        errorMap: () => ({ message: "Wizard type must be property, land, or blog" }),
    }),
    contentType: z.enum(["title", "description", "tags", "market_insights"], {
        errorMap: () => ({ message: "Content type must be title, description, tags, or market_insights" }),
    }),
    baseData: z.record(z.any()),
    language: LanguageSchema.default("es"),
    userId: z.string().uuid().optional(),
});