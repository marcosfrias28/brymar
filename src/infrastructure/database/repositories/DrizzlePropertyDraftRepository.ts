import { eq, and, gte, lte, like, desc, asc, count, sql } from 'drizzle-orm';
import {
    IPropertyDraftRepository,
    PropertyDraft,
    PropertyDraftId,
    PropertyDraftData,
    PropertyDraftSearchCriteria,
    PropertyDraftSearchResult
} from '@/domain/property/repositories/IPropertyDraftRepository';
import { propertyDrafts } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';

/**
 * Simple PropertyDraft implementation for the repository
 */
class PropertyDraftImpl implements PropertyDraft {
    constructor(private data: PropertyDraftData) { }

    getId(): PropertyDraftId {
        return this.data.id;
    }

    getUserId(): string {
        return this.data.userId;
    }

    getFormData(): any {
        return this.data.formData;
    }

    getStepCompleted(): number {
        return this.data.stepCompleted;
    }

    getTitle(): string | undefined {
        return this.data.title;
    }

    getPropertyType(): string | undefined {
        return this.data.propertyType;
    }

    getCompletionPercentage(): number {
        return this.data.completionPercentage;
    }

    getCreatedAt(): Date {
        return this.data.createdAt;
    }

    getUpdatedAt(): Date {
        return this.data.updatedAt;
    }

    updateFormData(data: any): void {
        this.data.formData = { ...this.data.formData, ...data };
        this.data.updatedAt = new Date();
    }

    updateStep(step: number): void {
        this.data.stepCompleted = step;
        this.data.updatedAt = new Date();
    }

    updateCompletionPercentage(percentage: number): void {
        this.data.completionPercentage = Math.max(0, Math.min(100, percentage));
        this.data.updatedAt = new Date();
    }

    updateTitle(title: string): void {
        this.data.title = title;
        this.data.updatedAt = new Date();
    }
}/*
*
 * Drizzle implementation of IPropertyDraftRepository
 */
export class DrizzlePropertyDraftRepository implements IPropertyDraftRepository {
    constructor(private readonly db: Database) { }

    /**
     * Find draft by ID
     */
    async findById(id: PropertyDraftId): Promise<PropertyDraft | null> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.id, id.value))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new Error(`Failed to find property draft by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Save draft (create or update)
     */
    async save(draft: PropertyDraft): Promise<void> {
        try {
            const draftData = this.mapToDatabase(draft);

            // Check if draft exists
            const existing = await this.db
                .select({ id: propertyDrafts.id })
                .from(propertyDrafts)
                .where(eq(propertyDrafts.id, draft.getId().value))
                .limit(1);

            if (existing.length === 0) {
                // Create new draft
                await this.db.insert(propertyDrafts).values(draftData);
            } else {
                // Update existing draft
                await this.db
                    .update(propertyDrafts)
                    .set(draftData)
                    .where(eq(propertyDrafts.id, draft.getId().value));
            }
        } catch (error) {
            throw new Error(`Failed to save property draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete draft by ID
     */
    async delete(id: PropertyDraftId): Promise<void> {
        try {
            await this.db
                .delete(propertyDrafts)
                .where(eq(propertyDrafts.id, id.value));
        } catch (error) {
            throw new Error(`Failed to delete property draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find drafts by user ID
     */
    async findByUserId(userId: string): Promise<PropertyDraft[]> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.userId, userId))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find property drafts by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
      * Find user's most recent draft
      */
    async findMostRecentByUserId(userId: string): Promise<PropertyDraft | null> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.userId, userId))
                .orderBy(desc(propertyDrafts.updatedAt))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new Error(`Failed to find most recent property draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search drafts with criteria
     */
    async search(criteria: PropertyDraftSearchCriteria): Promise<PropertyDraftSearchResult> {
        try {
            const conditions = this.buildSearchConditions(criteria);
            const orderBy = this.buildOrderBy(criteria.sortBy, criteria.sortOrder);

            // Get total count
            const totalResult = await this.db
                .select({ count: count() })
                .from(propertyDrafts)
                .where(conditions);

            const total = totalResult[0]?.count || 0;

            // Get paginated results
            let query = this.db
                .select()
                .from(propertyDrafts)
                .where(conditions)
                .orderBy(orderBy);

            if (criteria.limit) {
                query = query.limit(criteria.limit);
            }

            if (criteria.offset) {
                query = query.offset(criteria.offset);
            }

            const result = await query;
            const drafts = result.map(row => this.mapToDomain(row));

            const hasMore = criteria.offset && criteria.limit
                ? (criteria.offset + criteria.limit) < total
                : false;

            return {
                drafts,
                total,
                hasMore
            };
        } catch (error) {
            throw new Error(`Failed to search property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find drafts by property type
     */
    async findByPropertyType(propertyType: string): Promise<PropertyDraft[]> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.propertyType, propertyType))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find property drafts by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
       * Find incomplete drafts (below certain completion percentage)
       */
    async findIncomplete(maxCompletionPercentage: number = 80): Promise<PropertyDraft[]> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(lte(propertyDrafts.completionPercentage, maxCompletionPercentage))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find incomplete property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find abandoned drafts (not updated for a certain period)
     */
    async findAbandoned(daysOld: number): Promise<PropertyDraft[]> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(lte(propertyDrafts.updatedAt, cutoffDate))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find abandoned property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find drafts ready for completion (high completion percentage)
     */
    async findReadyForCompletion(minCompletionPercentage: number = 90): Promise<PropertyDraft[]> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(gte(propertyDrafts.completionPercentage, minCompletionPercentage))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find ready property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Count drafts by user
     */
    async countByUserId(userId: string): Promise<number> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(propertyDrafts)
                .where(eq(propertyDrafts.userId, userId));

            return result[0]?.count || 0;
        } catch (error) {
            throw new Error(`Failed to count property drafts by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Count total drafts
     */
    async count(criteria?: Partial<PropertyDraftSearchCriteria>): Promise<number> {
        try {
            const conditions = criteria ? this.buildSearchConditions(criteria) : undefined;

            const result = await this.db
                .select({ count: count() })
                .from(propertyDrafts)
                .where(conditions);

            return result[0]?.count || 0;
        } catch (error) {
            throw new Error(`Failed to count property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }    /**
 
    * Get draft statistics
     */
    async getStatistics(): Promise<{
        total: number;
        byPropertyType: Record<string, number>;
        averageCompletionPercentage: number;
        completedDrafts: number;
        abandonedDrafts: number;
    }> {
        try {
            const result = await this.db.select().from(propertyDrafts);

            const total = result.length;
            const byPropertyType: Record<string, number> = {};
            let totalCompletion = 0;
            let completedDrafts = 0;
            let abandonedDrafts = 0;

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            for (const row of result) {
                // Count by property type
                const type = row.propertyType || 'unknown';
                byPropertyType[type] = (byPropertyType[type] || 0) + 1;

                // Sum completion percentages
                totalCompletion += row.completionPercentage;

                // Count completed drafts (100% completion)
                if (row.completionPercentage >= 100) {
                    completedDrafts++;
                }

                // Count abandoned drafts (not updated in 30 days)
                if (row.updatedAt < thirtyDaysAgo) {
                    abandonedDrafts++;
                }
            }

            const averageCompletionPercentage = total > 0 ? totalCompletion / total : 0;

            return {
                total,
                byPropertyType,
                averageCompletionPercentage,
                completedDrafts,
                abandonedDrafts
            };
        } catch (error) {
            throw new Error(`Failed to get property draft statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Clean up old drafts (for maintenance)
     */
    async cleanupOldDrafts(daysOld: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            // Note: Drizzle doesn't return affected rows count directly
            await this.db
                .delete(propertyDrafts)
                .where(lte(propertyDrafts.updatedAt, cutoffDate));

            return 0; // Simplified implementation
        } catch (error) {
            throw new Error(`Failed to cleanup old property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if user has existing draft for property type
     */
    async hasExistingDraft(userId: string, propertyType: string): Promise<boolean> {
        try {
            const result = await this.db
                .select({ id: propertyDrafts.id })
                .from(propertyDrafts)
                .where(and(
                    eq(propertyDrafts.userId, userId),
                    eq(propertyDrafts.propertyType, propertyType)
                ))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            throw new Error(`Failed to check existing property draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
      * Find user's draft by property type
      */
    async findByUserIdAndType(userId: string, propertyType: string): Promise<PropertyDraft | null> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(and(
                    eq(propertyDrafts.userId, userId),
                    eq(propertyDrafts.propertyType, propertyType)
                ))
                .orderBy(desc(propertyDrafts.updatedAt))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new Error(`Failed to find property draft by user and type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Bulk delete drafts by criteria
     */
    async bulkDelete(criteria: Partial<PropertyDraftSearchCriteria>): Promise<number> {
        try {
            const conditions = this.buildSearchConditions(criteria);

            await this.db
                .delete(propertyDrafts)
                .where(conditions);

            return 0; // Simplified implementation
        } catch (error) {
            throw new Error(`Failed to bulk delete property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update draft completion percentage
     */
    async updateCompletionPercentage(id: PropertyDraftId, percentage: number): Promise<void> {
        try {
            await this.db
                .update(propertyDrafts)
                .set({
                    completionPercentage: Math.max(0, Math.min(100, percentage)),
                    updatedAt: new Date()
                })
                .where(eq(propertyDrafts.id, id.value));
        } catch (error) {
            throw new Error(`Failed to update completion percentage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update draft step
     */
    async updateStep(id: PropertyDraftId, step: number): Promise<void> {
        try {
            await this.db
                .update(propertyDrafts)
                .set({
                    stepCompleted: step,
                    updatedAt: new Date()
                })
                .where(eq(propertyDrafts.id, id.value));
        } catch (error) {
            throw new Error(`Failed to update draft step: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }    /*
*
     * Merge form data (partial update)
     */
    async mergeFormData(id: PropertyDraftId, partialData: any): Promise<void> {
        try {
            // First get the current draft
            const current = await this.findById(id);
            if (!current) {
                throw new Error('Property draft not found');
            }

            // Merge the data
            const mergedData = { ...current.getFormData(), ...partialData };

            await this.db
                .update(propertyDrafts)
                .set({
                    formData: mergedData,
                    updatedAt: new Date()
                })
                .where(eq(propertyDrafts.id, id.value));
        } catch (error) {
            throw new Error(`Failed to merge form data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if draft exists
     */
    async exists(id: PropertyDraftId): Promise<boolean> {
        try {
            const result = await this.db
                .select({ id: propertyDrafts.id })
                .from(propertyDrafts)
                .where(eq(propertyDrafts.id, id.value))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            throw new Error(`Failed to check if property draft exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find drafts that haven't been updated recently
     */
    async findStale(hoursOld: number): Promise<PropertyDraft[]> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(lte(propertyDrafts.updatedAt, cutoffDate))
                .orderBy(desc(propertyDrafts.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find stale property drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user's draft statistics
     */
    async getUserStatistics(userId: string): Promise<{
        totalDrafts: number;
        completedDrafts: number;
        averageCompletionPercentage: number;
        mostRecentActivity: Date | null;
        draftsByType: Record<string, number>;
    }> {
        try {
            const result = await this.db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.userId, userId));

            const totalDrafts = result.length;
            const draftsByType: Record<string, number> = {};
            let totalCompletion = 0;
            let completedDrafts = 0;
            let mostRecentActivity: Date | null = null;

            for (const row of result) {
                // Count by type
                const type = row.propertyType || 'unknown';
                draftsByType[type] = (draftsByType[type] || 0) + 1;

                // Sum completion
                totalCompletion += row.completionPercentage;

                // Count completed
                if (row.completionPercentage >= 100) {
                    completedDrafts++;
                }

                // Track most recent activity
                if (!mostRecentActivity || row.updatedAt > mostRecentActivity) {
                    mostRecentActivity = row.updatedAt;
                }
            }

            const averageCompletionPercentage = totalDrafts > 0 ? totalCompletion / totalDrafts : 0;

            return {
                totalDrafts,
                completedDrafts,
                averageCompletionPercentage,
                mostRecentActivity,
                draftsByType
            };
        } catch (error) {
            throw new Error(`Failed to get user draft statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }    /**

     * Build search conditions from criteria
     */
    private buildSearchConditions(criteria: Partial<PropertyDraftSearchCriteria>) {
        const conditions = [];

        if (criteria.userId) {
            conditions.push(eq(propertyDrafts.userId, criteria.userId));
        }

        if (criteria.propertyType) {
            conditions.push(eq(propertyDrafts.propertyType, criteria.propertyType));
        }

        if (criteria.minCompletionPercentage !== undefined) {
            conditions.push(gte(propertyDrafts.completionPercentage, criteria.minCompletionPercentage));
        }

        if (criteria.maxCompletionPercentage !== undefined) {
            conditions.push(lte(propertyDrafts.completionPercentage, criteria.maxCompletionPercentage));
        }

        if (criteria.createdAfter) {
            conditions.push(gte(propertyDrafts.createdAt, criteria.createdAfter));
        }

        if (criteria.createdBefore) {
            conditions.push(lte(propertyDrafts.createdAt, criteria.createdBefore));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    /**
     * Build order by clause
     */
    private buildOrderBy(sortBy?: string, sortOrder?: string) {
        const order = sortOrder === 'asc' ? asc : desc;

        switch (sortBy) {
            case 'completionPercentage':
                return order(propertyDrafts.completionPercentage);
            case 'title':
                return order(propertyDrafts.title);
            case 'createdAt':
                return order(propertyDrafts.createdAt);
            case 'updatedAt':
            default:
                return order(propertyDrafts.updatedAt);
        }
    }

    /**
     * Maps database row to domain entity
     */
    private mapToDomain(row: any): PropertyDraft {
        const data: PropertyDraftData = {
            id: { value: row.id },
            userId: row.userId,
            formData: row.formData || {},
            stepCompleted: row.stepCompleted || 0,
            title: row.title,
            propertyType: row.propertyType,
            completionPercentage: row.completionPercentage || 0,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt || row.createdAt,
        };

        return new PropertyDraftImpl(data);
    }

    /**
     * Maps domain entity to database row
     */
    private mapToDatabase(draft: PropertyDraft): any {
        return {
            id: draft.getId().value,
            userId: draft.getUserId(),
            formData: draft.getFormData(),
            stepCompleted: draft.getStepCompleted(),
            title: draft.getTitle(),
            propertyType: draft.getPropertyType(),
            completionPercentage: draft.getCompletionPercentage(),
            createdAt: draft.getCreatedAt(),
            updatedAt: draft.getUpdatedAt(),
        };
    }
}