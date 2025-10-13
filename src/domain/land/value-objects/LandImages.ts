import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

interface LandImageData {
    url: string;
    alt?: string;
    caption?: string;
    displayOrder: number;
}

export class LandImages extends ValueObject<LandImageData[]> {
    private static readonly MAX_IMAGES = 20;
    private static readonly MAX_ALT_LENGTH = 100;
    private static readonly MAX_CAPTION_LENGTH = 200;

    private constructor(images: LandImageData[]) {
        super(images);
    }

    static create(imageUrls: string[] = []): LandImages {
        if (!Array.isArray(imageUrls)) {
            throw new ValueObjectValidationError("Land images must be an array");
        }

        if (imageUrls.length > this.MAX_IMAGES) {
            throw new ValueObjectValidationError(`Cannot have more than ${this.MAX_IMAGES} images`);
        }

        // Convert URLs to image data with display order
        const imageData: LandImageData[] = imageUrls
            .filter(url => url && url.trim().length > 0)
            .map((url, index) => {
                this.validateImageUrl(url);
                return {
                    url: url.trim(),
                    displayOrder: index + 1
                };
            });

        return new LandImages(imageData);
    }

    static createWithDetails(images: LandImageData[]): LandImages {
        if (!Array.isArray(images)) {
            throw new ValueObjectValidationError("Land images must be an array");
        }

        if (images.length > this.MAX_IMAGES) {
            throw new ValueObjectValidationError(`Cannot have more than ${this.MAX_IMAGES} images`);
        }

        // Validate each image
        const validatedImages = images.map((image, index) => {
            this.validateImageUrl(image.url);

            if (image.alt && image.alt.length > this.MAX_ALT_LENGTH) {
                throw new ValueObjectValidationError(`Image alt text cannot exceed ${this.MAX_ALT_LENGTH} characters`);
            }

            if (image.caption && image.caption.length > this.MAX_CAPTION_LENGTH) {
                throw new ValueObjectValidationError(`Image caption cannot exceed ${this.MAX_CAPTION_LENGTH} characters`);
            }

            return {
                url: image.url.trim(),
                alt: image.alt?.trim(),
                caption: image.caption?.trim(),
                displayOrder: image.displayOrder || index + 1
            };
        });

        // Sort by display order
        validatedImages.sort((a, b) => a.displayOrder - b.displayOrder);

        return new LandImages(validatedImages);
    }

    static empty(): LandImages {
        return new LandImages([]);
    }

    private static validateImageUrl(url: string): void {
        if (!url || url.trim().length === 0) {
            throw new ValueObjectValidationError("Image URL cannot be empty");
        }

        const trimmedUrl = url.trim();

        // Basic URL validation
        try {
            new URL(trimmedUrl);
        } catch {
            throw new ValueObjectValidationError(`Invalid image URL: ${trimmedUrl}`);
        }

        // Check for common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        const hasImageExtension = imageExtensions.some(ext =>
            trimmedUrl.toLowerCase().includes(ext)
        );

        // Allow URLs without extensions if they contain common image hosting patterns
        const imageHostingPatterns = [
            'cloudinary.com',
            'amazonaws.com',
            'vercel-storage.com',
            'blob.vercel-storage.com',
            'images.unsplash.com',
            'cdn.',
            '/api/images/',
            '/uploads/'
        ];

        const hasImageHostingPattern = imageHostingPatterns.some(pattern =>
            trimmedUrl.toLowerCase().includes(pattern)
        );

        if (!hasImageExtension && !hasImageHostingPattern) {
            console.warn(`URL may not be a valid image: ${trimmedUrl}`);
        }
    }

    get images(): LandImageData[] {
        return [...this._value]; // Return a copy to maintain immutability
    }

    isEmpty(): boolean {
        return this._value.length === 0;
    }

    getCount(): number {
        return this._value.length;
    }

    getUrls(): string[] {
        return this._value.map(image => image.url);
    }

    getPrimaryImage(): LandImageData | null {
        if (this.isEmpty()) {
            return null;
        }

        // Return the first image by display order
        return this._value.reduce((primary, current) =>
            current.displayOrder < primary.displayOrder ? current : primary
        );
    }

    getPrimaryImageUrl(): string | null {
        const primary = this.getPrimaryImage();
        return primary ? primary.url : null;
    }

    addImage(url: string, alt?: string, caption?: string): LandImages {
        if (this._value.length >= LandImages.MAX_IMAGES) {
            throw new ValueObjectValidationError(`Cannot add more images. Maximum is ${LandImages.MAX_IMAGES}`);
        }

        LandImages.validateImageUrl(url);

        if (alt && alt.length > LandImages.MAX_ALT_LENGTH) {
            throw new ValueObjectValidationError(`Image alt text cannot exceed ${LandImages.MAX_ALT_LENGTH} characters`);
        }

        if (caption && caption.length > LandImages.MAX_CAPTION_LENGTH) {
            throw new ValueObjectValidationError(`Image caption cannot exceed ${LandImages.MAX_CAPTION_LENGTH} characters`);
        }

        // Check if image already exists
        if (this._value.some(image => image.url === url.trim())) {
            return this; // Image already exists, return unchanged
        }

        const newImage: LandImageData = {
            url: url.trim(),
            alt: alt?.trim(),
            caption: caption?.trim(),
            displayOrder: this._value.length + 1
        };

        return new LandImages([...this._value, newImage]);
    }

    removeImage(url: string): LandImages {
        const newImages = this._value.filter(image => image.url !== url);

        // Reorder remaining images
        const reorderedImages = newImages.map((image, index) => ({
            ...image,
            displayOrder: index + 1
        }));

        return new LandImages(reorderedImages);
    }

    updateImageAlt(url: string, alt: string): LandImages {
        if (alt.length > LandImages.MAX_ALT_LENGTH) {
            throw new ValueObjectValidationError(`Image alt text cannot exceed ${LandImages.MAX_ALT_LENGTH} characters`);
        }

        const updatedImages = this._value.map(image =>
            image.url === url ? { ...image, alt: alt.trim() } : image
        );

        return new LandImages(updatedImages);
    }

    updateImageCaption(url: string, caption: string): LandImages {
        if (caption.length > LandImages.MAX_CAPTION_LENGTH) {
            throw new ValueObjectValidationError(`Image caption cannot exceed ${LandImages.MAX_CAPTION_LENGTH} characters`);
        }

        const updatedImages = this._value.map(image =>
            image.url === url ? { ...image, caption: caption.trim() } : image
        );

        return new LandImages(updatedImages);
    }

    reorderImages(newOrder: string[]): LandImages {
        if (newOrder.length !== this._value.length) {
            throw new ValueObjectValidationError("New order must include all existing images");
        }

        const reorderedImages = newOrder.map((url, index) => {
            const existingImage = this._value.find(image => image.url === url);
            if (!existingImage) {
                throw new ValueObjectValidationError(`Image with URL ${url} not found`);
            }
            return {
                ...existingImage,
                displayOrder: index + 1
            };
        });

        return new LandImages(reorderedImages);
    }

    // Get images sorted by display order
    getSortedImages(): LandImageData[] {
        return [...this._value].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    // Convert to JSON for storage
    toJSON(): LandImageData[] {
        return [...this._value];
    }

    static fromJSON(data: LandImageData[]): LandImages {
        return LandImages.createWithDetails(data);
    }

    // Convert to simple URL array for backward compatibility
    toUrlArray(): string[] {
        return this.getUrls();
    }

    static fromUrlArray(urls: string[]): LandImages {
        return LandImages.create(urls);
    }
}