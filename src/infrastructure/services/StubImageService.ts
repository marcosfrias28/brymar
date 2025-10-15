import { IImageService, ImageInput, ProcessedImage } from "@/application/services/interfaces/IImageService";

/**
 * Stub implementation of IImageService for development/testing
 * In production, this would be replaced with actual cloud storage service
 */
export class StubImageService implements IImageService {
    async processImages(images: ImageInput[]): Promise<ProcessedImage[]> {
        // For now, just return mock processed images
        return images.map((image, index) => ({
            url: `/images/property-${Date.now()}-${index}.jpg`,
            filename: image.filename,
            size: image.file.size || 0,
            mimeType: image.mimeType,
        }));
    }

    async deleteImage(_imageUrl: string): Promise<void> {
        // Stub implementation - in production would delete from cloud storage
        // Note: Would delete image in production
    }

    async getImageMetadata(_imageUrl: string): Promise<{ size: number; mimeType: string } | null> {
        // Stub implementation - in production would fetch from cloud storage
        return {
            size: 1024000, // 1MB
            mimeType: "image/jpeg",
        };
    }
}