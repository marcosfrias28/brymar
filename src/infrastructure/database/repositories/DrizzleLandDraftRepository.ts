import { eq, and, desc, count, gte, lte, like } from "drizzle-orm";
import type { Database } from '@/lib/db/drizzle';
import { landDrafts } from '@/lib/db/schema';
import {
    ILandDraftRepository,
    LandDraftData
} from '@/domain/land/repositories/ILandDraftRepository';
import { InfrastructureError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from "crypto";

export class DrizzleLandDraftRepository implements ILandDraftRepository {
    constructor(private readonly _database: Database) { }

    async save(draft: LandDraftData): Promise<string> {
        try {
            // If no ID provided, generate one
            const draftId = draft.id || randomUUID();

            // Check if draft exists
            const existing = await this.database
                .select({ id: landDrafts.id })
                .from(landDrafts)
                .where(eq(landDrafts.id, draftId))
                .limit(1);

            const draftData = {
                id: draftId,
                userId: draft.userId,
                formData: draft.formData,
                stepCompleted: draft.stepCompleted,
                completionPercentage: draft.completionPercentage,
                title: this.extractTitleFromFormData(draft.formData),
                landType: this.extractLandTypeFromFormData(draft.formData),
                updatedAt: new Date(),
            };

            if (existing.length > 0) {
                // Update existing draft
                await this.database
                    .update(landDrafts)
                    .set(draftData)
                    .where(eq(landDrafts.id, draftId));
            } else {
                // Insert new draft
                await this.database.insert(landDrafts).values({
                    ...draftData,
                    createdAt: new Date(),
                });
            }

            return draftId;
        } catch (error) {
            throw new InfrastructureError(`Failed to save land draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findById(draftId: string): Promise<LandDraftData | null> {
        try {
            const result = await this.database
                .select()
                .from(landDrafts)
                .where(eq(landDrafts.id, draftId))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new InfrastructureError(`Failed to find land draft by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByUserId(userId: string): Promise<LandDraftData[]> {
        try {
            const results = await this.database
                .select()
                .from(landDrafts)
                .where(eq(landDrafts.userId, userId))
                .orderBy(desc(landDrafts.updatedAt));

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find land drafts by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByUserAndLand(userId: string, landId: string): Promise<LandDraftData | null> {
        try {
            // Check if there's a draft for editing an existing land
            const result = await this.database
                .select()
                .from(landDrafts)
                .where(
                    and(
                        eq(landDrafts.userId, userId),
                        like(landDrafts.formData, `%"landId":"${landId}"%`)
                    )
                )
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new InfrastructureError(`Failed to find land draft by user and land: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async update(
        draftId: string,
        formData: Record<string, any>,
        stepCompleted: number,
        completionPercentage: number
    ): Promise<void> {
        try {
            const result = await this.database
                .update(landDrafts)
                .set({
                    formData,
                    stepCompleted,
                    completionPercentage,
                    title: this.extractTitleFromFormData(formData),
                    landType: this.extractLandTypeFromFormData(formData),
                    updatedAt: new Date(),
                })
                .where(eq(landDrafts.id, draftId))
                .returning();

            if (result.length === 0) {
                throw new InfrastructureError("Land draft not found");
            }
        } catch (error) {
            throw new InfrastructureError(`Failed to update land draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(draftId: string): Promise<void> {
        try {
            const result = await this.database
                .delete(landDrafts)
                .where(eq(landDrafts.id, draftId))
                .returning();

            if (result.length === 0) {
                throw new InfrastructureError("Land draft not found");
            }
        } catch (error) {
            throw new InfrastructureError(`Failed to delete land draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteByUserId(userId: string): Promise<void> {
        try {
            await this.database
                .delete(landDrafts)
                .where(eq(landDrafts.userId, userId));
        } catch (error) {
            throw new InfrastructureError(`Failed to delete land drafts by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteOlderThan(days: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await this.database
                .delete(landDrafts)
                .where(lte(landDrafts.updatedAt, cutoffDate))
                .returning();

            return result.length;
        } catch (error) {
            throw new InfrastructureError(`Failed to delete old land drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async exists(draftId: string): Promise<boolean> {
        try {
            const result = await this.database
                .select({ id: landDrafts.id })
                .from(landDrafts)
                .where(eq(landDrafts.id, draftId))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            throw new InfrastructureError(`Failed to check land draft existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByUserId(userId: string): Promise<number> {
        try {
            const result = await this.database
                .select({ count: count() })
                .from(landDrafts)
                .where(eq(landDrafts.userId, userId));

            return result[0].count;
        } catch (error) {
            throw new InfrastructureError(`Failed to count land drafts by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findIncomplete(userId: string, maxAge?: number): Promise<LandDraftData[]> {
        try {
            const conditions = [
                eq(landDrafts.userId, userId),
                lte(landDrafts.completionPercentage, 99) // Less than 100% complete
            ];

            if (maxAge) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - maxAge);
                conditions.push(gte(landDrafts.updatedAt, cutoffDate));
            }

            const results = await this.database
                .select()
                .from(landDrafts)
                .where(and(...conditions))
                .orderBy(desc(landDrafts.updatedAt));

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find incomplete land drafts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private extractTitleFromFormData(formData: Record<string, any>): string | null {
        // Extract title from various possible locations in form data
        return formData.name ||
            formData.title ||
            formData.general?.name ||
            formData.general?.title ||
            null;
    }

    private extractLandTypeFromFormData(formData: Record<string, any>): string | null {
        // Extract land type from various possible locations in form data
        return formData.type ||
            formData.landType ||
            formData.general?.type ||
            formData.general?.landType ||
            null;
    }

    private mapToDomain(row: any): LandDraftData {
        return {
            id: row.id,
            userId: row.userId,
            landId: this.extractLandIdFromFormData(row.formData),
            formData: row.formData || {},
            stepCompleted: row.stepCompleted || 0,
            completionPercentage: row.completionPercentage || 0,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt || row.createdAt,
        };
    }

    private extractLandIdFromFormData(formData: Record<string, any>): string | undefined {
        // Extract land ID if this is an edit draft
        return formData.landId ||
            formData.id ||
            formData.general?.landId ||
            formData.general?.id ||
            undefined;
    }
}