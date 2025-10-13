import { z } from "zod";

export class PublishWizardInput {
    constructor(
        public readonly draftId: string,
        public readonly userId: string,
        public readonly finalFormData?: Record<string, any>
    ) { }

    static create(data: {
        draftId: string;
        userId: string;
        finalFormData?: Record<string, any>;
    }): PublishWizardInput {
        const validated = PublishWizardInputSchema.parse(data);

        return new PublishWizardInput(
            validated.draftId,
            validated.userId,
            validated.finalFormData
        );
    }

    static fromFormData(formData: FormData): PublishWizardInput {
        const data = {
            draftId: formData.get("draftId")?.toString() || "",
            userId: formData.get("userId")?.toString() || "",
            finalFormData: formData.get("finalFormData")
                ? JSON.parse(formData.get("finalFormData")?.toString() || "{}")
                : undefined,
        };

        return PublishWizardInput.create(data);
    }
}

const PublishWizardInputSchema = z.object({
    draftId: z.string().uuid("Draft ID must be a valid UUID"),
    userId: z.string().uuid("User ID must be a valid UUID"),
    finalFormData: z.record(z.any()).optional(),
});