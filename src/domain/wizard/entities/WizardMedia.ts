import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { DomainError } from '@/domain/shared/errors/DomainError';
import { WizardMediaId } from "../value-objects/WizardMediaId";
import { WizardDraftId } from "../value-objects/WizardDraftId";
import { WizardType } from "../value-objects/WizardType";
import { MediaType } from "../value-objects/MediaType";
import { MediaUrl } from "../value-objects/MediaUrl";
import { MediaMetadata } from "../value-objects/MediaMetadata";

export interface CreateWizardMediaData {
    draftId?: string;
    publishedId?: number;
    wizardType: string;
    mediaType: string;
    url: string;
    filename: string;
    originalFilename?: string;
    size: number;
    contentType: string;
    width?: number;
    height?: number;
    duration?: number;
    displayOrder?: number;
}

export interface WizardMediaData {
    id: WizardMediaId;
    draftId?: WizardDraftId;
    publishedId?: number;
    wizardType: WizardType;
    mediaType: MediaType;
    url: MediaUrl;
    metadata: MediaMetadata;
    displayOrder: number;
    uploadedAt: Date;
    createdAt: Date;
}

export class WizardMedia extends AggregateRoot {
    private constructor(
        private readonly id: WizardMediaId,
        private readonly draftId: WizardDraftId | undefined,
        private readonly publishedId: number | undefined,
        private readonly wizardType: WizardType,
        private readonly mediaType: MediaType,
        private readonly url: MediaUrl,
        private readonly metadata: MediaMetadata,
        private displayOrder: number,
        private readonly uploadedAt: Date,
        createdAt?: Date
    ) {
        super(id, createdAt);
    }

    static create(data: CreateWizardMediaData): WizardMedia {
        const id = WizardMediaId.generate();
        const draftId = data.draftId ? WizardDraftId.create(data.draftId) : undefined;
        const wizardType = WizardType.create(data.wizardType);
        const mediaType = MediaType.create(data.mediaType);
        const url = MediaUrl.create(data.url);
        const metadata = MediaMetadata.create({
            filename: data.filename,
            originalFilename: data.originalFilename,
            size: data.size,
            contentType: data.contentType,
            width: data.width,
            height: data.height,
            duration: data.duration,
        });

        // Validate that either draftId or publishedId is provided
        if (!data.draftId && !data.publishedId) {
            throw new DomainError("Either draft ID or published ID must be provided");
        }

        const displayOrder = data.displayOrder ?? 0;
        if (displayOrder < 0) {
            throw new DomainError("Display order cannot be negative");
        }

        return new WizardMedia(
            id,
            draftId,
            data.publishedId,
            wizardType,
            mediaType,
            url,
            metadata,
            displayOrder,
            new Date(),
            new Date()
        );
    }

    static reconstitute(data: WizardMediaData): WizardMedia {
        return new WizardMedia(
            data.id,
            data.draftId,
            data.publishedId,
            data.wizardType,
            data.mediaType,
            data.url,
            data.metadata,
            data.displayOrder,
            data.uploadedAt,
            data.createdAt
        );
    }

    updateDisplayOrder(order: number): void {
        if (order < 0) {
            throw new DomainError("Display order cannot be negative");
        }
        this.displayOrder = order;
    }

    isImage(): boolean {
        return this.mediaType.isImage();
    }

    isVideo(): boolean {
        return this.mediaType.isVideo();
    }

    belongsToDraft(draftId: WizardDraftId): boolean {
        return this.draftId?.equals(draftId) ?? false;
    }

    belongsToPublished(publishedId: number): boolean {
        return this.publishedId === publishedId;
    }

    // Getters
    getId(): WizardMediaId {
        return this.id;
    }

    getDraftId(): WizardDraftId | undefined {
        return this.draftId;
    }

    getPublishedId(): number | undefined {
        return this.publishedId;
    }

    getWizardType(): WizardType {
        return this.wizardType;
    }

    getMediaType(): MediaType {
        return this.mediaType;
    }

    getUrl(): MediaUrl {
        return this.url;
    }

    getMetadata(): MediaMetadata {
        return this.metadata;
    }

    getDisplayOrder(): number {
        return this.displayOrder;
    }

    getUploadedAt(): Date {
        return this.uploadedAt;
    }
}