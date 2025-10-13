import { z } from "zod";

export class LoadWizardDraftInput {
    constructor(
        public readonly draftId: string,
        public readonly userId: string
    ) { }

    static create(data: {
        draftId: string;
        userId: string;
    }): LoadWizardDraftInput {
        const validated = LoadWizardDraftInputSchema.parse(data);

        return new LoadWizardDraftInput(
            validated.draftId,
            validated.userId
        );
    }

    static fromParams(draftId: string, userId: string): LoadWizardDraftInput {
        return LoadWizardDraftInput.create({ draftId, userId });
    }
}

const LoadWizardDraftInputSchema = z.object({
    draftId: z.string().uuid("Draft ID must be a valid UUID"),
    userId: z.string().uuid("User ID must be a valid UUID"),
});