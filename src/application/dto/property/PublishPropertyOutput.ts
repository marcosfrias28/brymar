import { Property } from '@/domain/property/entities/Property';

/**
 * Output DTO for property publish result
 */
export class PublishPropertyOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly status: string,
        public readonly publishedAt: Date,
        public readonly publishedBy?: string,
        public readonly publishNotes?: string,
        public readonly scheduledPublishDate?: Date,
        public readonly featured: boolean,
        public readonly featuredUntil?: Date,
        public readonly notificationsSent: boolean,
        public readonly url: string
    ) { }

    /**
     * Creates PublishPropertyOutput from a Property entity
     */
    static from(
        property: Property,
        publishedBy?: string,
        publishNotes?: string,
        scheduledPublishDate?: Date,
        featuredUntil?: Date,
        notificationsSent: boolean = false,
        baseUrl: string = ''
    ): PublishPropertyOutput {
        const propertyUrl = `${baseUrl}/properties/${property.getId().value}`;

        return new PublishPropertyOutput(
            property.getId().value,
            property.getTitle().value,
            property.getStatus().value,
            property.getUpdatedAt(), // When it was published
            publishedBy,
            publishNotes,
            scheduledPublishDate,
            property.isFeatured(),
            featuredUntil,
            notificationsSent,
            propertyUrl
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            status: this.status,
            publishedAt: this.publishedAt.toISOString(),
            publishedBy: this.publishedBy,
            publishNotes: this.publishNotes,
            scheduledPublishDate: this.scheduledPublishDate?.toISOString(),
            featured: this.featured,
            featuredUntil: this.featuredUntil?.toISOString(),
            notificationsSent: this.notificationsSent,
            url: this.url,
        };
    }

    /**
     * Checks if property was scheduled for publishing
     */
    wasScheduled(): boolean {
        return !!this.scheduledPublishDate;
    }

    /**
     * Checks if property is currently featured
     */
    isCurrentlyFeatured(): boolean {
        return this.featured && (!this.featuredUntil || this.featuredUntil > new Date());
    }
}