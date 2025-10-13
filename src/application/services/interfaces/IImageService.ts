export interface ProcessedImage {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

export interface ImageInput {
    file: File;
    filename: string;
    mimeType: string;
}

/**
 * Interface for image processing and storage services
 */
export interface IImageService {
    /**
     * Process and upload images
     */
    processImages(images: ImageInput[]): Promise<ProcessedImage[]>;

    /**
     * Delete an image from storage
     */
    deleteImage(imageUrl: string): Promise<void>;

    /**
     * Get image metadata
     */
    getImageMetadata(imageUrl: string): Promise<{ size: number; mimeType: string } | null>;
}