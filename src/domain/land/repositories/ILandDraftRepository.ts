import { BaseDraftRepository, DraftData } from '@/domain/shared/interfaces/BaseDraftRepository';

export interface LandDraftData extends DraftData {
    landId?: string; // If editing existing land
}

export interface ILandDraftRepository extends BaseDraftRepository<LandDraftData> {
    /**
     * Find draft by user ID and land ID (for editing existing land)
     */
    findByUserAndLand(userId: string, landId: string): Promise<LandDraftData | null>;

    /**
     * Delete all drafts for a user
     */
    deleteByUserId(userId: string): Promise<void>;
}