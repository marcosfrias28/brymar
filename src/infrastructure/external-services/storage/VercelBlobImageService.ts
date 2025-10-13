import { put, del } from '@vercel/blob';
import {
    IImageService,
    ImageInput,
    ProcessedImage
} from '@/application/services/interfaces';

/**
 * Vercel Blob implementation of IImageService
 * Handles image upload, processing, and management using Vercel Blob storage
 */
export class VercelBlobImageService implements IImageService {
    private readonly baseUrl: string;

    constructor() {
        // Vercel Blob automatically handles the token from environment variables
        this.baseUrl = process.env.BLOB_READ_WRITE_TOKEN ? 'https://blob.vercel-storage.com' : '';

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.warn('BLOB_READ_WRITE_TOKEN not found in environment variables');
        }
    }

    /**
     * Process and upload multiple images
     */
    async processImages(images: ImageInput[]): Promise<ProcessedImage[]> {
        try {
            const processedImages: ProcessedImage[] = [];

            for (const image of images) {
                const processed = await this.processImage(image);
                processedImages.push(processed);
            }

            return processedImages;
        } catch (error) {
            throw new Error(`Failed to process images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process and upload a single image
     */
    private async processImage(image: ImageInput): Promise<ProcessedImage> {
        try {
            // Validate image
            this.validateImage(image);

            // Generate unique filename
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const extension = this.getFileExtension(image.filename);
            const uniqueFilename = `property-images/${timestamp}-${randomId}${extension}`;

            // Upload to Vercel Blob
            const blob = await put(uniqueFilename, image.file, {
                access: 'public',
                contentType: image.mimeType,
            });

            // Get image dimensions (simplified - in production, use image processing library)
            const dimensions = await this.getImageDimensions(image);

            // Generate thumbnail URL (Vercel Blob doesn't have built-in thumbnails)
            // In production, you might want to create actual thumbnails
            const thumbnailUrl = blob.url;

            return {
                id: this.extractIdFromUrl(blob.url),
                url: blob.url,
                thumbnailUrl,
                filename: uniqueFilename,
                size: this.getFileSize(image.file),
                dimensions
            };
        } catch (error) {
            throw new Error(`Failed to process image ${image.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete an image by ID
     */
    async deleteImage(imageId: string): Promise<void> {
        try {
            // Reconstruct the blob URL from the image ID
            const url = this.reconstructUrlFromId(imageId);

            if (!url) {
                throw new Error('Invalid image ID or URL format');
            }

            await del(url);
        } catch (error) {
            throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get image URL by ID
     */
    getImageUrl(imageId: string): string {
        const url = this.reconstructUrlFromId(imageId);
        if (!url) {
            throw new Error('Invalid image ID');
        }
        return url;
    }
    /**
       * Validate image input
       */
    private validateImage(image: ImageInput): void {
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const fileSize = this.getFileSize(image.file);

        if (fileSize > maxSize) {
            throw new Error(`Image ${image.filename} exceeds maximum size of 10MB`);
        }

        // Check MIME type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        if (!allowedTypes.includes(image.mimeType.toLowerCase())) {
            throw new Error(`Unsupported image type: ${image.mimeType}`);
        }

        // Check filename
        if (!image.filename || image.filename.trim().length === 0) {
            throw new Error('Image filename is required');
        }
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(filename: string): string {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return '';
        }
        return filename.substring(lastDotIndex);
    }

    /**
     * Get file size from File or Buffer
     */
    private getFileSize(file: File | Buffer): number {
        if (file instanceof File) {
            return file.size;
        } else if (Buffer.isBuffer(file)) {
            return file.length;
        }
        return 0;
    }

    /**
     * Get image dimensions (simplified implementation)
     * In production, use a proper image processing library like sharp
     */
    private async getImageDimensions(image: ImageInput): Promise<{ width: number; height: number }> {
        try {
            // This is a simplified implementation
            // In production, you would use a library like sharp to get actual dimensions

            if (image.file instanceof File) {
                // For browser File objects, we can't easily get dimensions server-side
                // Return default dimensions
                return { width: 800, height: 600 };
            }

            // For Buffer objects, you could use sharp or similar library
            // For now, return default dimensions
            return { width: 800, height: 600 };
        } catch (error) {
            // Return default dimensions if we can't determine actual size
            return { width: 800, height: 600 };
        }
    }

    /**
     * Extract ID from Vercel Blob URL
     */
    private extractIdFromUrl(url: string): string {
        try {
            // Vercel Blob URLs have a specific format
            // Extract a unique identifier from the URL
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];

            // Use the filename as the ID, or extract a hash from the URL
            return filename || url.split('/').pop() || Math.random().toString(36);
        } catch (error) {
            return Math.random().toString(36);
        }
    }

    /**
     * Reconstruct URL from ID (simplified implementation)
     */
    private reconstructUrlFromId(imageId: string): string | null {
        try {
            // This is a simplified implementation
            // In production, you might store the full URL in your database
            // or have a more sophisticated ID-to-URL mapping

            if (imageId.startsWith('http')) {
                // If the ID is actually a full URL, return it
                return imageId;
            }

            // If it's just a filename, we can't easily reconstruct the full Vercel Blob URL
            // without additional information. In production, store the full URL.
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate a thumbnail URL (placeholder implementation)
     * Vercel Blob doesn't have built-in thumbnail generation
     */
    private generateThumbnailUrl(originalUrl: string): string {
        // In production, you might:
        // 1. Use a service like Cloudinary for automatic thumbnails
        // 2. Generate thumbnails during upload and store them separately
        // 3. Use URL parameters for on-the-fly resizing if supported

        // For now, return the original URL
        return originalUrl;
    }

    /**
     * Create a thumbnail version of an image (placeholder implementation)
     */
    private async createThumbnail(image: ImageInput): Promise<ProcessedImage> {
        // In production, you would:
        // 1. Resize the image to thumbnail dimensions (e.g., 200x200)
        // 2. Upload the thumbnail as a separate file
        // 3. Return the thumbnail information

        // For now, just process the original image
        return this.processImage(image);
    }

    /**
     * Batch delete multiple images
     */
    async deleteImages(imageIds: string[]): Promise<void> {
        try {
            const deletePromises = imageIds.map(id => this.deleteImage(id));
            await Promise.all(deletePromises);
        } catch (error) {
            throw new Error(`Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if an image exists
     */
    async imageExists(imageId: string): Promise<boolean> {
        try {
            const url = this.reconstructUrlFromId(imageId);
            if (!url) {
                return false;
            }

            // Try to fetch the image to check if it exists
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get image metadata
     */
    async getImageMetadata(imageId: string): Promise<{
        url: string;
        size?: number;
        contentType?: string;
        lastModified?: Date;
    } | null> {
        try {
            const url = this.reconstructUrlFromId(imageId);
            if (!url) {
                return null;
            }

            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                return null;
            }

            return {
                url,
                size: response.headers.get('content-length') ?
                    parseInt(response.headers.get('content-length')!) : undefined,
                contentType: response.headers.get('content-type') || undefined,
                lastModified: response.headers.get('last-modified') ?
                    new Date(response.headers.get('last-modified')!) : undefined,
            };
        } catch (error) {
            return null;
        }
    }
}