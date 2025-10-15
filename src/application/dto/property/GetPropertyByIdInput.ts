import { z } from "zod";
import { IdSchema } from "@/domain/shared/schemas";

export const GetPropertyByIdInputSchema = z.object({
    id: IdSchema,
});

export type GetPropertyByIdInputData = z.infer<typeof GetPropertyByIdInputSchema>;

export class GetPropertyByIdInput {
    constructor(public readonly id: string) { }

    static fromId(id: string): GetPropertyByIdInput {
        const validated = GetPropertyByIdInputSchema.parse({ id });
        return new GetPropertyByIdInput(validated.id);
    }

    static fromFormData(formData: FormData): GetPropertyByIdInput {
        const id = formData.get("id") as string;
        return GetPropertyByIdInput.fromId(id);
    }
}