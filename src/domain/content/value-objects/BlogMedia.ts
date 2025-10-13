import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

export interface BlogImage {
    id: string;
    url: string;
    filename: string;
    alt?: string;
    caption?: string;
}

export interface BlogMediaData {
    coverImage?: string;
    images: BlogImage[];
}

export class BlogMedia extends ValueObject<BlogMediaData> {
    private static readonly MAX_IMAGES = 20;

    private constructor(value: BlogMediaData) {
        super(value);
    }

    static create(data: BlogMediaData): BlogMedia {
        const validatedData = this.validateMediaData(data);
        return new BlogMedia(validatedData);
    }

    static empty(): BlogMedia {
        return new BlogMedia({
            images: []
        });
    }

    private static validateMediaData(data: BlogMediaData): BlogMediaData {
        // Validate cover image URL if provided
        if (data.coverImage && !this.isValidUrl(data.coverImage)) {
            throw new DomainError('Cover image must be a valid URL');
        }

        // Validate images array
        if (data.images.length > this.MAX_IMAGES) {
            throw new DomainError(`Cannot have more than ${this.MAX_IMAGES} images`);
        }

        // Validate each image
        data.images.forEach((image, index) => {
            if (!image.id || image.id.trim().length === 0) {
                throw new DomainError(`Image at index ${index} must have an ID`);
            }
            if (!image.url || !this.isValidUrl(image.url)) {
                throw new DomainError(`Image at index ${index} must have a valid URL`);
            }
            if (!image.filename || image.filename.trim().length === 0) {
                throw new DomainError(`Image at index ${index} must have a filename`);
            }
        });

        // Check for duplicate image IDs
        const imageIds = data.images.map(img => img.id);
        const uniqueIds = new Set(imageIds);
        if (imageIds.length !== uniqueIds.size) {
            throw new DomainError('Duplicate image IDs are not allowed');
        }

        return {
            coverImage: data.coverImage?.trim(),
            images: data.images.map(img => ({
                id: img.id.trim(),
                url: img.url.trim(),
                filename: img.filename.trim(),
                alt: img.alt?.trim(),
                caption: img.caption?.trim()
            }))
        };
    }

    private static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    get coverImage(): string | undefined {
        return this.value.coverImage;
    }

    get images(): BlogImage[] {
        return this.value.images;
    }

    hasCoverImage(): boolean {
        return !!this.value.coverImage;
    }

    hasImages(): boolean {
        return this.value.images.length > 0;
    }

    getImageCount(): number {
        return this.value.images.length;
    }

    getImageById(id: string): BlogImage | undefined {
        return this.value.images.find(img => img.id === id);
    }

    setCoverImage(imageUrl: string): BlogMedia {
        if (!BlogMedia.isValidUrl(imageUrl)) {
            throw new DomainError('Cover image must be a valid URL');
        }

        return BlogMedia.create({
            ...this.value,
            coverImage: imageUrl.trim()
        });
    }

    removeCoverImage(): BlogMedia {
        return BlogMedia.create({
            ...this.value,
            coverImage: undefined
        });
    }

    addImage(imageData: BlogImage): BlogMedia {
        if (this.value.images.length >= BlogMedia.MAX_IMAGES) {
            throw new DomainError(`Cannot add more than ${BlogMedia.MAX_IMAGES} images`);
        }

        if (this.getImageById(imageData.id)) {
            throw new DomainError('Image with this ID already exists');
        }

        return BlogMedia.create({
            ...this.value,
            images: [...this.value.images, imageData]
        });
    }

    removeImage(imageId: string): BlogMedia {
        const newImages = this.value.images.filter(img => img.id !== imageId);

        if (newImages.length === this.value.images.length) {
            throw new DomainError('Image not found');
        }

        return BlogMedia.create({
            ...this.value,
            images: newImages
        });
    }

    updateImageAlt(imageId: string, alt: string): BlogMedia {
        const imageIndex = this.value.images.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
            throw new DomainError('Image not found');
        }

        const updatedImages = [...this.value.images];
        updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            alt: alt.trim()
        };

        return BlogMedia.create({
            ...this.value,
            images: updatedImages
        });
    }

    updateImageCaption(imageId: string, caption: string): BlogMedia {
        const imageIndex = this.value.images.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
            throw new DomainError('Image not found');
        }

        const updatedImages = [...this.value.images];
        updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            caption: caption.trim()
        };

        return BlogMedia.create({
            ...this.value,
            images: updatedImages
        });
    }

    // SEO and accessibility checks
    hasProperAltTexts(): boolean {
        return this.value.images.every(img =>
            img.alt && img.alt.trim().length > 0
        );
    }

    getImagesWithoutAlt(): BlogImage[] {
        return this.value.images.filter(img =>
            !img.alt || img.alt.trim().length === 0
        );
    }

    // Content quality checks
    isOptimizedForSEO(): boolean {
        return this.hasCoverImage() && this.hasProperAltTexts();
    }

    getMediaSummary(): string {
        const parts: string[] = [];

        if (this.hasCoverImage()) {
            parts.push('1 imagen de portada');
        }

        if (this.hasImages()) {
            parts.push(`${this.getImageCount()} imagen${this.getImageCount() > 1 ? 'es' : ''}`);
        }

        return parts.length > 0 ? parts.join(', ') : 'Sin medios';
    }
}