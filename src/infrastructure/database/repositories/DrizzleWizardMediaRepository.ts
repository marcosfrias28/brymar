import { eq, and, desc, asc, count, gte, lte, isNull } from "drizzle-orm";
import type { Database } from '@/lib/db/drizzle';
import { wizardMedia } from '@/lib/db/schema';
import {
    IWizardMediaRepository,
    WizardMediaFilters,
    WizardMediaSearchOptions,
    WizardMediaSearchResult
} from '@/domain/wizard/repositories/IWizardMediaRepository';
import { WizardMedia } from '@/domain/wizard/entities/WizardMedia';
import { WizardMediaId } from '@/domain/wizard/value-objects/WizardMediaId';
import { WizardDraftId } from '@/domain/wizard/value-objects/WizardDraftId';
import { WizardType } from '@/domain/wizard/value-objects/WizardType';
import { MediaType } from '@/domain/wizard/value-objects/MediaType';
import { MediaUrl } from '@/domain/wizard/value-objects/MediaUrl';
import { MediaMetadata } from '@/domain/wizard/value-objects/MediaMetadata';

export class DrizzleWizardMediaRepository implements IWizardMediaRepository {
    constructor(private readonly db: Database) { }

    async save(media: WizardMedia): Promise<void> {
        const mediaData = this.mapToDatabase(media);

        // Check if media exists
        const existing = await this.db
            .select({ id: wizardMedia.id })
            .from(wizardMedia)
            .where(eq(wizardMedia.id, mediaData.id))
            .limit(1);

        if (existing.length > 0) {
            // Update existing media
            await this.db
                .update(wizardMedia)
                .set(mediaData)
                .where(eq(wizardMedia.id, mediaData.id));
        } else {
            // Insert new media
            await this.db.insert(wizardMedia).values(mediaData);
        }
    }

    async saveMany(mediaItems: WizardMedia[]): Promise<void> {
        if (mediaItems.length === 0) return;

        const mediaData = mediaItems.map(media => this.mapToDatabase(media));

        // Use batch insert for better performance
        await this.db.insert(wizardMedia).values(mediaData);
    }

    async findById(id: WizardMediaId): Promise<WizardMedia | null> {
        const result = await this.db
            .select()
            .from(wizardMedia)
            .where(eq(wizardMedia.id, id.value))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToDomain(result[0]);
    }

    async findByDraftId(draftId: WizardDraftId): Promise<WizardMedia[]> {
        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(eq(wizardMedia.draftId, draftId.value))
            .orderBy(asc(wizardMedia.displayOrder), desc(wizardMedia.uploadedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findByPublishedId(publishedId: number, wizardType: WizardType): Promise<WizardMedia[]> {
        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(
                and(
                    eq(wizardMedia.publishedId, publishedId),
                    eq(wizardMedia.wizardType, wizardType.value)
                )
            )
            .orderBy(asc(wizardMedia.displayOrder), desc(wizardMedia.uploadedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findByWizardType(wizardType: WizardType): Promise<WizardMedia[]> {
        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(eq(wizardMedia.wizardType, wizardType.value))
            .orderBy(desc(wizardMedia.uploadedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async findByMediaType(mediaType: MediaType): Promise<WizardMedia[]> {
        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(eq(wizardMedia.mediaType, mediaType.value))
            .orderBy(desc(wizardMedia.uploadedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async search(filters: WizardMediaFilters, options: WizardMediaSearchOptions = {}): Promise<WizardMediaSearchResult> {
        const conditions = this.buildWhereConditions(filters);
        const { limit = 20, offset = 0, sortBy = "uploadedAt", sortOrder = "desc" } = options;

        // Build order by clause
        let orderByColumn;
        switch (sortBy) {
            case "uploadedAt":
                orderByColumn = wizardMedia.uploadedAt;
                break;
            case "displayOrder":
                orderByColumn = wizardMedia.displayOrder;
                break;
            case "filename":
                orderByColumn = wizardMedia.filename;
                break;
            default:
                orderByColumn = wizardMedia.uploadedAt;
        }
        const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

        // Get total count
        const totalResult = await this.db
            .select({ count: count() })
            .from(wizardMedia)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = totalResult[0]?.count || 0;

        // Get paginated results
        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        const media = results.map(row => this.mapToDomain(row));
        const hasMore = offset + limit < total;

        return {
            media,
            total,
            hasMore,
        };
    }

    async delete(id: WizardMediaId): Promise<void> {
        await this.db
            .delete(wizardMedia)
            .where(eq(wizardMedia.id, id.value));
    }

    async deleteByDraftId(draftId: WizardDraftId): Promise<void> {
        await this.db
            .delete(wizardMedia)
            .where(eq(wizardMedia.draftId, draftId.value));
    }

    async deleteByPublishedId(publishedId: number, wizardType: WizardType): Promise<void> {
        await this.db
            .delete(wizardMedia)
            .where(
                and(
                    eq(wizardMedia.publishedId, publishedId),
                    eq(wizardMedia.wizardType, wizardType.value)
                )
            );
    }

    async updateDisplayOrder(mediaIds: WizardMediaId[], newOrders: number[]): Promise<void> {
        if (mediaIds.length !== newOrders.length) {
            throw new Error("Media IDs and new orders arrays must have the same length");
        }

        // Update each media item's display order
        for (let i = 0; i < mediaIds.length; i++) {
            await this.db
                .update(wizardMedia)
                .set({ displayOrder: newOrders[i] })
                .where(eq(wizardMedia.id, mediaIds[i].value));
        }
    }

    async moveToPublished(draftId: WizardDraftId, publishedId: number): Promise<void> {
        await this.db
            .update(wizardMedia)
            .set({
                publishedId,
                draftId: null
            })
            .where(eq(wizardMedia.draftId, draftId.value));
    }

    async count(filters: WizardMediaFilters): Promise<number> {
        const conditions = this.buildWhereConditions(filters);

        const result = await this.db
            .select({ count: count() })
            .from(wizardMedia)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return result[0]?.count || 0;
    }

    async exists(id: WizardMediaId): Promise<boolean> {
        const result = await this.db
            .select({ id: wizardMedia.id })
            .from(wizardMedia)
            .where(eq(wizardMedia.id, id.value))
            .limit(1);

        return result.length > 0;
    }

    async findOrphaned(olderThanDays?: number): Promise<WizardMedia[]> {
        const conditions = [
            isNull(wizardMedia.draftId),
            isNull(wizardMedia.publishedId)
        ];

        if (olderThanDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            conditions.push(lte(wizardMedia.uploadedAt, cutoffDate));
        }

        const results = await this.db
            .select()
            .from(wizardMedia)
            .where(and(...conditions))
            .orderBy(desc(wizardMedia.uploadedAt));

        return results.map(row => this.mapToDomain(row));
    }

    async getStatistics(): Promise<{
        totalMedia: number;
        totalSize: number;
        mediaByType: Record<string, number>;
        mediaByWizardType: Record<string, number>;
    }> {
        // Get all media
        const allMedia = await this.db.select().from(wizardMedia);

        const totalMedia = allMedia.length;
        const totalSize = allMedia.reduce((sum: number, media: any) => sum + media.size, 0);

        // Count by media type
        const mediaByType: Record<string, number> = {};
        allMedia.forEach((media: any) => {
            mediaByType[media.mediaType] = (mediaByType[media.mediaType] || 0) + 1;
        });

        // Count by wizard type
        const mediaByWizardType: Record<string, number> = {};
        allMedia.forEach((media: any) => {
            mediaByWizardType[media.wizardType] = (mediaByWizardType[media.wizardType] || 0) + 1;
        });

        return {
            totalMedia,
            totalSize,
            mediaByType,
            mediaByWizardType,
        };
    }

    async findByUrl(url: string): Promise<WizardMedia | null> {
        const result = await this.db
            .select()
            .from(wizardMedia)
            .where(eq(wizardMedia.url, url))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToDomain(result[0]);
    }

    async getNextDisplayOrder(draftId: WizardDraftId): Promise<number> {
        const result = await this.db
            .select({ maxOrder: wizardMedia.displayOrder })
            .from(wizardMedia)
            .where(eq(wizardMedia.draftId, draftId.value))
            .orderBy(desc(wizardMedia.displayOrder))
            .limit(1);

        const maxOrder = result[0]?.maxOrder || -1;
        return maxOrder + 1;
    }

    private buildWhereConditions(filters: WizardMediaFilters): any[] {
        const conditions = [];

        if (filters.draftId) {
            conditions.push(eq(wizardMedia.draftId, filters.draftId.value));
        }

        if (filters.publishedId) {
            conditions.push(eq(wizardMedia.publishedId, filters.publishedId));
        }

        if (filters.wizardType) {
            conditions.push(eq(wizardMedia.wizardType, filters.wizardType.value));
        }

        if (filters.mediaType) {
            conditions.push(eq(wizardMedia.mediaType, filters.mediaType.value));
        }

        if (filters.uploadedAfter) {
            conditions.push(gte(wizardMedia.uploadedAt, filters.uploadedAfter));
        }

        if (filters.uploadedBefore) {
            conditions.push(lte(wizardMedia.uploadedAt, filters.uploadedBefore));
        }

        return conditions;
    }

    private mapToDatabase(media: WizardMedia): any {
        const metadata = media.getMetadata().value;

        return {
            id: media.getId().value,
            draftId: media.getDraftId()?.value || null,
            publishedId: media.getPublishedId() || null,
            wizardType: media.getWizardType().value,
            mediaType: media.getMediaType().value,
            url: media.getUrl().value,
            filename: metadata.filename,
            originalFilename: metadata.originalFilename || null,
            size: metadata.size,
            contentType: metadata.contentType,
            width: metadata.width || null,
            height: metadata.height || null,
            duration: metadata.duration || null,
            displayOrder: media.getDisplayOrder(),
            uploadedAt: media.getUploadedAt(),
            createdAt: media.getCreatedAt(),
        };
    }

    private mapToDomain(row: any): WizardMedia {
        return WizardMedia.reconstitute({
            id: WizardMediaId.create(row.id),
            draftId: row.draftId ? WizardDraftId.create(row.draftId) : undefined,
            publishedId: row.publishedId,
            wizardType: WizardType.create(row.wizardType),
            mediaType: MediaType.create(row.mediaType),
            url: MediaUrl.create(row.url),
            metadata: MediaMetadata.create({
                filename: row.filename,
                originalFilename: row.originalFilename,
                size: row.size,
                contentType: row.contentType,
                width: row.width,
                height: row.height,
                duration: row.duration,
            }),
            displayOrder: row.displayOrder,
            uploadedAt: row.uploadedAt,
            createdAt: row.createdAt,
        });
    }
}