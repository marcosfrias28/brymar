"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { wizardDrafts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
    WizardDraft,
    CreateWizardDraftInput,
    UpdateWizardDraftInput,
    PublishWizardInput,
    GenerateAIContentInput,
    CreateWizardDraftResult,
    UpdateWizardDraftResult,
    GetWizardDraftResult,
    PublishWizardResult,
    GenerateAIContentResult,
    DeleteWizardDraftResult,
    WizardType,
} from "@/lib/types";
import { createProperty } from "./properties";
import { createLand } from "./lands";
import { createBlogPost } from "./blog";

/**
 * Save wizard draft - replaces SaveWizardDraftUseCase
 */
export async function saveWizardDraft(
    input: UpdateWizardDraftInput
): Promise<UpdateWizardDraftResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        if (input.id) {
            // Update existing draft
            const [updatedDraft] = await db
                .update(wizardDrafts)
                .set({
                    title: input.title,
                    description: input.description,
                    currentStep: input.currentStep || 0,
                    data: input.data || {},
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(wizardDrafts.id, input.id),
                        eq(wizardDrafts.userId, session.user.id)
                    )
                )
                .returning();

            if (!updatedDraft) {
                return { success: false, error: "Draft not found or access denied" };
            }

            revalidatePath("/dashboard/wizard");
            return {
                success: true,
                data: {
                    ...updatedDraft,
                    description: updatedDraft.description || undefined
                } as WizardDraft
            };
        } else {
            return { success: false, error: "Draft ID is required for updates" };
        }
    } catch (error) {
        console.error("Error saving wizard draft:", error);
        return { success: false, error: "Failed to save wizard draft" };
    }
}

/**
 * Create new wizard draft
 */
export async function createWizardDraft(
    input: CreateWizardDraftInput
): Promise<CreateWizardDraftResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const [newDraft] = await db
            .insert(wizardDrafts)
            .values({
                id: crypto.randomUUID(),
                type: input.type,
                title: input.title,
                description: input.description,
                currentStep: 0,
                status: "draft",
                steps: {},
                data: input.initialData || {},
                userId: session.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        revalidatePath("/dashboard/wizard");
        return { success: true, data: newDraft as WizardDraft };
    } catch (error) {
        console.error("Error creating wizard draft:", error);
        return { success: false, error: "Failed to create wizard draft" };
    }
}

/**
 * Load wizard draft - replaces LoadWizardDraftUseCase
 */
export async function loadWizardDraft(
    draftId: string
): Promise<GetWizardDraftResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const draft = await db.query.wizardDrafts.findFirst({
            where: and(
                eq(wizardDrafts.id, draftId),
                eq(wizardDrafts.userId, session.user.id)
            ),
        });

        if (!draft) {
            return { success: false, error: "Draft not found or access denied" };
        }

        return { success: true, data: draft as WizardDraft };
    } catch (error) {
        console.error("Error loading wizard draft:", error);
        return { success: false, error: "Failed to load wizard draft" };
    }
}

/**
 * Get all wizard drafts for current user
 */
export async function getWizardDrafts(
    type?: WizardType
): Promise<{ success: boolean; data?: WizardDraft[]; error?: string }> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const drafts = await db.query.wizardDrafts.findMany({
            where: type
                ? and(eq(wizardDrafts.userId, session.user.id), eq(wizardDrafts.type, type))
                : eq(wizardDrafts.userId, session.user.id),
            orderBy: (drafts, { desc }) => [desc(drafts.updatedAt)],
        });

        return { success: true, data: drafts as WizardDraft[] };
    } catch (error) {
        console.error("Error getting wizard drafts:", error);
        return { success: false, error: "Failed to get wizard drafts" };
    }
}

/**
 * Delete wizard draft
 */
export async function deleteWizardDraft(
    draftId: string
): Promise<DeleteWizardDraftResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const result = await db
            .delete(wizardDrafts)
            .where(
                and(
                    eq(wizardDrafts.id, draftId),
                    eq(wizardDrafts.userId, session.user.id)
                )
            );

        revalidatePath("/dashboard/wizard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting wizard draft:", error);
        return { success: false, error: "Failed to delete wizard draft" };
    }
}

/**
 * Publish wizard - replaces PublishWizardUseCase
 */
export async function publishWizard(
    input: PublishWizardInput
): Promise<PublishWizardResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Load the draft
        const draft = await db.query.wizardDrafts.findFirst({
            where: and(
                eq(wizardDrafts.id, input.id),
                eq(wizardDrafts.userId, session.user.id)
            ),
        });

        if (!draft) {
            return { success: false, error: "Draft not found or access denied" };
        }

        // Use final data if provided, otherwise use draft data
        const finalData = input.finalData || draft.data;

        // Type assertion for the data
        const typedFinalData = finalData as any;

        let publishedItem: any;
        let publishResult: any;

        // Publish based on wizard type
        switch (draft.type) {
            case "property":
                publishResult = await createProperty(typedFinalData);
                if (!publishResult.success) {
                    return { success: false, error: publishResult.error };
                }
                publishedItem = publishResult.data;
                break;

            case "land":
                publishResult = await createLand(typedFinalData);
                if (!publishResult.success) {
                    return { success: false, error: publishResult.error };
                }
                publishedItem = publishResult.data;
                break;

            case "blog":
                publishResult = await createBlogPost(typedFinalData);
                if (!publishResult.success) {
                    return { success: false, error: publishResult.error };
                }
                publishedItem = publishResult.data;
                break;

            default:
                return { success: false, error: `Unsupported wizard type: ${draft.type}` };
        }

        // Update draft status to published
        const [updatedDraft] = await db
            .update(wizardDrafts)
            .set({
                status: "published",
                publishedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(wizardDrafts.id, input.id))
            .returning();

        revalidatePath("/dashboard/wizard");
        revalidatePath("/dashboard");

        return {
            success: true,
            data: {
                draft: updatedDraft as WizardDraft,
                publishedItem,
            },
        };
    } catch (error) {
        console.error("Error publishing wizard:", error);
        return { success: false, error: "Failed to publish wizard" };
    }
}

/**
 * Generate AI content - replaces GenerateAIContentUseCase
 */
export async function generateAIContent(
    input: GenerateAIContentInput
): Promise<GenerateAIContentResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // This is a simplified implementation
        // In a real app, you would integrate with an AI service
        let generatedContent: Record<string, any> = {};

        switch (input.wizardType) {
            case "property":
                generatedContent = await generatePropertyContent(input);
                break;
            case "land":
                generatedContent = await generateLandContent(input);
                break;
            case "blog":
                generatedContent = await generateBlogContent(input);
                break;
            default:
                return { success: false, error: `Unsupported wizard type: ${input.wizardType}` };
        }

        return {
            success: true,
            data: {
                content: generatedContent,
                model: "simplified-ai-v1",
                confidence: 0.85,
            },
        };
    } catch (error) {
        console.error("Error generating AI content:", error);
        return { success: false, error: "Failed to generate AI content" };
    }
}

/**
 * Helper functions for AI content generation
 */
async function generatePropertyContent(
    input: GenerateAIContentInput
): Promise<Record<string, any>> {
    const { contentType, baseData } = input;

    switch (contentType) {
        case "title":
            return {
                title: `Beautiful ${baseData.propertyType || "Property"} in ${baseData.location || "Prime Location"
                    }`,
            };
        case "description":
            return {
                description: `This stunning ${baseData.propertyType || "property"
                    } offers ${baseData.bedrooms || "multiple"} bedrooms and ${baseData.bathrooms || "modern"
                    } bathrooms in the desirable ${baseData.location || "area"
                    }. Perfect for those seeking comfort and convenience.`,
            };
        case "tags":
            return {
                tags: [
                    baseData.propertyType || "property",
                    baseData.location || "location",
                    "modern",
                    "comfortable",
                ],
            };
        default:
            return {};
    }
}

async function generateLandContent(
    input: GenerateAIContentInput
): Promise<Record<string, any>> {
    const { contentType, baseData } = input;

    switch (contentType) {
        case "title":
            return {
                title: `Prime ${baseData.landType || "Land"} - ${baseData.area || "Spacious"
                    } in ${baseData.location || "Great Location"}`,
            };
        case "description":
            return {
                description: `Excellent ${baseData.landType || "land"
                    } opportunity covering ${baseData.area || "substantial area"} in ${baseData.location || "prime location"
                    }. Ideal for development or investment purposes.`,
            };
        case "tags":
            return {
                tags: [
                    baseData.landType || "land",
                    baseData.location || "location",
                    "investment",
                    "development",
                ],
            };
        default:
            return {};
    }
}

async function generateBlogContent(
    input: GenerateAIContentInput
): Promise<Record<string, any>> {
    const { contentType, baseData } = input;

    switch (contentType) {
        case "title":
            return {
                title: `${baseData.topic || "Interesting Topic"}: A Comprehensive Guide`,
            };
        case "description":
            return {
                description: `Discover everything you need to know about ${baseData.topic || "this topic"
                    }. This comprehensive guide covers all the essential aspects.`,
            };
        case "tags":
            return {
                tags: [
                    baseData.category || "general",
                    baseData.topic || "topic",
                    "guide",
                    "comprehensive",
                ],
            };
        default:
            return {};
    }
}