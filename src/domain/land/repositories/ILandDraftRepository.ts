import { LandId } from "../value-objects/LandId";

export interface LandDraftData {
    id?: string;
    userId: string;
    landId?: string; // If editing existing land
    formData: Record<string, any>;
    stepCompleted: number;
    completionPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILandDraftRepository {
    /**
     * Save a land draft
     */
    save(draft: LandDraftData): Promise<string>; // Returns draft ID

    /**
     * Find a draft by ID
     */
    findById(draftId: string): Promise<LandDraftData | null>;

    /**
     * Find drafts by user ID
     */
    findByUserId(userId: string): Promise<LandDraftData[]>;

    /**
     * Find draft by user ID and land ID (for editing existing land)
     */
    findByUserAndLand(userId: string, landId: string): Promise<LandDraftData | null>;

    /**
     * Update draft data
     */
    update(
        draftId: string,
        formData: Record<string, any>,
        stepCompleted: number,
        completionPercentage: number
    ): Promise<void>;

    /**
     * Delete a draft
     */
    delete(draftId: string): Promise<void>;

    /**
     * Delete all drafts for a user
     */
    deleteByUserId(userId: string): Promise<void>;

    /**
     * Delete old drafts (cleanup)
     */
    deleteOlderThan(days: number): Promise<number>; // Returns count of deleted drafts

    /**
     * Check if draft exists
     */
    exists(draftId: string): Promise<boolean>;

    /**
     * Get draft count for user
     */
    countByUserId(userId: string): Promise<number>;

    /**
     * Find incomplete drafts (for reminders)
     */
    findIncomplete(userId: string, maxAge?: number): Promise<LandDraftData[]>;
}