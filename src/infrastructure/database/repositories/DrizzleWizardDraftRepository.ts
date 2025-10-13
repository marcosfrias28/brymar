import { eq, and, desc, asc, count, gte, lte, like } from "drizzle-orm";
import type { Database } from '@/lib/db/drizzle';
import { wizardDrafts } from '@/lib/db/schema';
import {
    IWizardDraftRepository,
    WizardDraftFilters,
    WizardDraftSearchOptions,
    WizardDraftSearchResult
} from '@/domain/wizard/repositories/IWizardDraftRepository';
import { WizardDraft } from '@/domain/wizard/entities/WizardDraft';
import { WizardDraftId } from '@/domain/wizard/value-objects/WizardDraftId';
import { WizardType } from '@/domain/wizard/value-objects/WizardType';
import { StepProgress } from '@/domain/wizard/value-objects/StepProgress';
import { CompletionPercentage } from '@/domain/wizard/value-objects/CompletionPercentage';
import { WizardFormData } from '@/domain/wizard/value-objects/WizardFormData';
import { UserId } from '@/domain/user/value-objects/UserId';

export class DrizzleWizardDraftRepository implements IWizardDraftRepository {
    constructor(private readonly db: Database) { }

    async save(draft: WizardDraft): Promise<void> {
        const draftData = this.mapToDatabase(draft);

        // Check if draft exists
        const existing = await this.db
            .select({ id: wizardDrafts.id })
            .from(wizardDrafts)
            .where(eq(wizardDrafts.id, draftData.id))
            .limit(1);

        if (existing.length > 0) {
            // Update existing draft
            await this.db
                .update(wizardDrafts)
                .set({
                    ...draftData,
                    updatedAt: new Date(),
                })
                .where(eq(wizardDrafts.id, draftData.id));
        } else {
            // Insert new draft
            await this.db.insert(wizardDrafts).values(draftData);
        }
    }

    async findById(id: WizardDraftId): Promise<WizardDraft | null> {
        const result = await this.db
            .select()
            .from(wizardDrafts)
            .where(eq(wizardDrafts.id, id.value))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToDomain(result[0]);
    }

    async findByUserId(userId: UserId): Promise<WizardDraft[]> {
        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(eq(wizardDrafts.userId, userId.value))
            .orderBy(desc(wizardDrafts.updatedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findByWizardType(wizardType: WizardType): Promise<WizardDraft[]> {
        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(eq(wizardDrafts.wizardType, wizardType.value))
            .orderBy(desc(wizardDrafts.updatedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findByUserIdAndWizardType(userId: UserId, wizardType: WizardType): Promise<WizardDraft[]> {
        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(
                and(
                    eq(wizardDrafts.userId, userId.value),
                    eq(wizardDrafts.wizardType, wizardType.value)
                )
            )
            .orderBy(desc(wizardDrafts.updatedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async search(filters: WizardDraftFilters, options: WizardDraftSearchOptions = {}): Promise<WizardDraftSearchResult> {
        const conditions = this.buildWhereConditions(filters);
        const { limit = 20, offset = 0, sortBy = "updatedAt", sortOrder = "desc" } = options;

        // Build order by clause
        let orderByColumn;
        switch (sortBy) {
            case "updatedAt":
                orderByColumn = wizardDrafts.updatedAt;
                break;
            case "createdAt":
                orderByColumn = wizardDrafts.createdAt;
                break;
            case "completionPercentage":
                orderByColumn = wizardDrafts.completionPercentage;
                break;
            case "title":
                orderByColumn = wizardDrafts.title;
                break;
            default:
                orderByColumn = wizardDrafts.updatedAt;
        }
        const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

        // Get total count
        const totalResult = await this.db
            .select({ count: count() })
            .from(wizardDrafts)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = totalResult[0]?.count || 0;

        // Get paginated results
        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        const drafts = results.map(row => this.mapToDomain(row));
        const hasMore = offset + limit < total;

        return {
            drafts,
            total,
            hasMore,
        };
    }

    async delete(id: WizardDraftId): Promise<void> {
        await this.db
            .delete(wizardDrafts)
            .where(eq(wizardDrafts.id, id.value));
    }

    async deleteByUserId(userId: UserId): Promise<void> {
        await this.db
            .delete(wizardDrafts)
            .where(eq(wizardDrafts.userId, userId.value));
    }

    async count(filters: WizardDraftFilters): Promise<number> {
        const conditions = this.buildWhereConditions(filters);

        const result = await this.db
            .select({ count: count() })
            .from(wizardDrafts)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return result[0]?.count || 0;
    }

    async exists(id: WizardDraftId): Promise<boolean> {
        const result = await this.db
            .select({ id: wizardDrafts.id })
            .from(wizardDrafts)
            .where(eq(wizardDrafts.id, id.value))
            .limit(1);

        return result.length > 0;
    }

    async findIncomplete(userId?: UserId, olderThanDays?: number): Promise<WizardDraft[]> {
        const conditions = [];

        if (userId) {
            conditions.push(eq(wizardDrafts.userId, userId.value));
        }

        // Find drafts with completion percentage < 100
        conditions.push(lte(wizardDrafts.completionPercentage, 99));

        if (olderThanDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            conditions.push(lte(wizardDrafts.updatedAt, cutoffDate));
        }

        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(and(...conditions))
            .orderBy(desc(wizardDrafts.updatedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findStale(olderThanDays: number): Promise<WizardDraft[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const results = await this.db
            .select()
            .from(wizardDrafts)
            .where(lte(wizardDrafts.updatedAt, cutoffDate))
            .orderBy(desc(wizardDrafts.updatedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async getUserStatistics(userId: UserId): Promise<{
        totalDrafts: number;
        completedDrafts: number;
        draftsByType: Record<string, number>;
        averageCompletionPercentage: number;
    }> {
        // Get all drafts for user
        const userDrafts = await this.db
            .select()
            .from(wizardDrafts)
            .where(eq(wizardDrafts.userId, userId.value));

        const totalDrafts = userDrafts.length;
        const completedDrafts = userDrafts.filter(draft => draft.completionPercentage === 100).length;

        // Count drafts by type
        const draftsByType: Record<string, number> = {};
        userDrafts.forEach(draft => {
            draftsByType[draft.wizardType] = (draftsByType[draft.wizardType] || 0) + 1;
        });

        // Calculate average completion percentage
        const totalCompletion = userDrafts.reduce((sum, draft) => sum + (draft.completionPercentage ?? 0), 0);
        const averageCompletionPercentage = totalDrafts > 0 ? Math.round(totalCompletion / totalDrafts) : 0;

        return {
            totalDrafts,
            completedDrafts,
            draftsByType,
            averageCompletionPercentage,
        };
    }

    private buildWhereConditions(filters: WizardDraftFilters): any[] {
        const conditions = [];

        if (filters.userId) {
            conditions.push(eq(wizardDrafts.userId, filters.userId.value));
        }

        if (filters.wizardType) {
            conditions.push(eq(wizardDrafts.wizardType, filters.wizardType.value));
        }

        if (filters.wizardConfigId) {
            conditions.push(eq(wizardDrafts.wizardConfigId, filters.wizardConfigId));
        }

        if (filters.completionPercentageMin !== undefined) {
            conditions.push(gte(wizardDrafts.completionPercentage, filters.completionPercentageMin));
        }

        if (filters.completionPercentageMax !== undefined) {
            conditions.push(lte(wizardDrafts.completionPercentage, filters.completionPercentageMax));
        }

        if (filters.createdAfter) {
            conditions.push(gte(wizardDrafts.createdAt, filters.createdAfter));
        }

        if (filters.createdBefore) {
            conditions.push(lte(wizardDrafts.createdAt, filters.createdBefore));
        }

        if (filters.updatedAfter) {
            conditions.push(gte(wizardDrafts.updatedAt, filters.updatedAfter));
        }

        if (filters.updatedBefore) {
            conditions.push(lte(wizardDrafts.updatedAt, filters.updatedBefore));
        }

        return conditions;
    }

    private mapToDatabase(draft: WizardDraft): any {
        return {
            id: draft.getId().value,
            userId: draft.getUserId().value,
            wizardType: draft.getWizardType().value,
            wizardConfigId: draft.getWizardConfigId(),
            formData: draft.getFormData().toJSON(),
            currentStep: draft.getCurrentStep(),
            stepProgress: draft.getStepProgress().toJSON(),
            completionPercentage: draft.getCompletionPercentage().value,
            title: draft.getTitle(),
            description: draft.getDescription(),
            createdAt: draft.getCreatedAt(),
            updatedAt: draft.getUpdatedAt(),
        };
    }

    private mapToDomain(row: any): WizardDraft {
        return WizardDraft.reconstitute({
            id: WizardDraftId.create(row.id),
            userId: UserId.create(row.userId),
            wizardType: WizardType.create(row.wizardType),
            wizardConfigId: row.wizardConfigId,
            formData: WizardFormData.create(row.formData || {}),
            currentStep: row.currentStep,
            stepProgress: StepProgress.create(row.stepProgress || {}),
            completionPercentage: CompletionPercentage.create(row.completionPercentage ?? 0),
            title: row.title,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}