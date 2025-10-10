"use server";

import { put } from "@vercel/blob";
import { shouldUseMockStorage, getBlobConfigInfo } from "@/lib/config/blob-config";
import { z } from "zod";
import {
    SignedUrlResponse,
    UploadResult,
    ImageMetadata,
    UploadError
} from "@/types/wizard";
import { UploadError as WizardUploadError, ErrorFactory } from "../errors/wizard-errors";
import { retryUploadOperation, circuitBreakers } from "../utils/retry-logic";
import { validateUploadedFile, validateImageUrl, generateSecureFilename, performCompleteSecurityValidation } from "../security/file-upload-security";
import { checkImageUploadRateLimit, recordSuccessfulOperation, recordFailedOperation } from "../security/rate-limiting";
import { generatePresignedUploadUrl } from "../security/signed-url-generation";

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const UPLOAD_PATH_PREFIX = 'properties';

// Validation schemas
const FileUploadSchema = z.object({
    filename: z.string().min(1),
    contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
    size: z.number().max(MAX_FILE_SIZE), // 10MB max
});

// Helper functions
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

function generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isRetryableError(error: any): boolean {
    if (!error) return false;

    if (error instanceof WizardUploadError) {
        return error.retryable;
    }

    const retryableMessages = [
        'network',
        'timeout',
        'connection',
        'temporary',
        'rate limit',
        '503',
        '502',
        '504'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Generate a signed URL for direct upload to Vercel Blob
 * Note: For this implementation, we'll use direct upload instead of signed URLs
 * as Vercel Blob doesn't support signed URLs in the same way as AWS S3
 */
export async function generateSignedUrl(
    filename: string,
    contentType: string
): Promise<SignedUrlResponse> {
    // Validate input
    const validation = FileUploadSchema.safeParse({
        filename,
        contentType,
        size: 0, // Size will be validated during actual upload
    });

    if (!validation.success) {
        throw new Error(`Invalid file parameters: ${validation.error.message}`);
    }

    // For Vercel Blob, we return a placeholder structure
    // The actual upload will happen in uploadDirect method
    const timestamp = Date.now();
    const sanitizedFilename = sanitizeFilename(filename);
    const uploadPath = `${UPLOAD_PATH_PREFIX}/${timestamp}-${sanitizedFilename}`;

    return {
        uploadUrl: uploadPath, // This will be used as the path for Vercel Blob
        publicUrl: '', // Will be populated after upload
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    };
}

/**
 * Upload file directly to Vercel Blob storage
 */
export async function uploadDirect(
    file: File,
    uploadPath: string,
    userId?: string
): Promise<UploadResult> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkImageUploadRateLimit(clientId);

        // Comprehensive security validation
        const securityValidation = await performCompleteSecurityValidation(file, 'image');
        if (!securityValidation.valid) {
            throw new WizardUploadError(
                `Security validation failed: ${securityValidation.errors.join(', ')}`,
                'SECURITY_VALIDATION_FAILED',
                false,
                { errors: securityValidation.errors, warnings: securityValidation.warnings }
            );
        }

        // Basic file validation
        await validateUploadedFile(file, 'image');

        // Generate secure filename
        const secureFilename = generateSecureFilename(file.name, 'image');
        const securePath = uploadPath.replace(/[^/]+$/, secureFilename);
        const result = await retryUploadOperation(async () => {
            return await circuitBreakers.uploadService.execute(async () => {
                // Check if we should use mock storage
                if (shouldUseMockStorage()) {
                    const mockUrl = `https://mock-storage.example.com/images/${secureFilename}`;
                    console.warn(`[Upload Service] Using mock storage: ${mockUrl}`);

                    return {
                        url: mockUrl,
                        filename: secureFilename,
                        size: file.size,
                        contentType: file.type,
                    };
                }

                try {
                    // Upload to Vercel Blob with secure path
                    const { url } = await put(securePath, file, {
                        access: 'public',
                        contentType: file.type,
                    });

                    // Validate the returned URL
                    validateImageUrl(url);

                    return {
                        url,
                        filename: secureFilename,
                        size: file.size,
                        contentType: file.type,
                    };
                } catch (blobError: any) {
                    console.error('Vercel Blob upload error:', blobError);

                    // Check if it's a "store does not exist" error
                    if (blobError.message && blobError.message.includes('store does not exist')) {
                        const configInfo = getBlobConfigInfo();
                        console.error('[Upload Service] Blob store configuration issue:', {
                            error: configInfo.error,
                            recommendations: configInfo.recommendations
                        });

                        // For development/testing, create a mock URL
                        if (configInfo.isDevelopment) {
                            const mockUrl = `https://mock-storage.example.com/images/${secureFilename}`;
                            console.warn(`[Upload Service] Using mock URL due to Blob store configuration: ${mockUrl}`);

                            return {
                                url: mockUrl,
                                filename: secureFilename,
                                size: file.size,
                                contentType: file.type,
                            };
                        }
                    }

                    // Re-throw other blob errors
                    throw blobError;
                }
            });
        });

        // Record successful operation
        await recordSuccessfulOperation('imageUpload', clientId);

        return result;
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);

        // Record failed operation
        await recordFailedOperation('imageUpload', clientId);

        if (error instanceof WizardUploadError) {
            throw error;
        }

        // Check for specific Vercel Blob errors
        if (error instanceof Error) {
            if (error.message.includes('413') || error.message.includes('too large')) {
                throw new WizardUploadError(
                    'File too large for upload service',
                    'FILE_TOO_LARGE',
                    false,
                    { originalError: error.message }
                );
            }

            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new WizardUploadError(
                    'Upload quota exceeded',
                    'QUOTA_EXCEEDED',
                    false,
                    { originalError: error.message }
                );
            }

            if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new WizardUploadError(
                    'Network error during upload',
                    'NETWORK_ERROR',
                    true,
                    { originalError: error.message }
                );
            }
        }

        throw new WizardUploadError(
            `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'UPLOAD_FAILED',
            true,
            { originalError: error }
        );
    }
}

/**
 * Process upload result and create image metadata
 */
export async function processMetadata(uploadResult: UploadResult, displayOrder: number = 0): Promise<ImageMetadata> {
    return {
        id: generateId(),
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
        contentType: uploadResult.contentType,
        displayOrder,
        // Width and height will be populated by client-side processing
    };
}

/**
 * Upload multiple images with error handling
 */
export async function uploadMultipleImages(files: File[]): Promise<{
    successful: ImageMetadata[];
    failed: UploadError[];
}> {
    const results = await Promise.allSettled(
        files.map(async (file, index) => {
            const signedUrl = await generateSignedUrl(file.name, file.type);
            const uploadResult = await uploadDirect(file, signedUrl.uploadUrl);
            return await processMetadata(uploadResult, index);
        })
    );

    return results.reduce(
        (acc, result, index) => {
            if (result.status === 'fulfilled') {
                acc.successful.push(result.value);
            } else {
                acc.failed.push({
                    file: files[index],
                    error: result.reason.message || 'Error desconocido',
                    retryable: isRetryableError(result.reason),
                });
            }
            return acc;
        },
        { successful: [], failed: [] } as {
            successful: ImageMetadata[];
            failed: UploadError[];
        }
    );
}

/**
 * Delete image from Vercel Blob (if needed)
 * Note: Vercel Blob doesn't have a direct delete API in the current version
 */
export async function deleteImage(url: string): Promise<void> {
    // For now, we'll just log the deletion request
    // In a production environment, you might want to implement cleanup logic
    console.log(`Image deletion requested for: ${url}`);
}

// Server action for uploading images (main entry point)
export async function uploadPropertyImages(files: File[]): Promise<{
    successful: ImageMetadata[];
    failed: UploadError[];
}> {
    try {
        return await uploadMultipleImages(files);
    } catch (error) {
        console.error('Error in uploadPropertyImages:', error);
        return {
            successful: [],
            failed: files.map(file => ({
                file,
                error: error instanceof Error ? error.message : 'Error desconocido',
                retryable: false,
            })),
        };
    }
}

// Server action for single image upload
export async function uploadSinglePropertyImage(file: File): Promise<ImageMetadata> {
    try {
        const signedUrl = await generateSignedUrl(file.name, file.type);
        const uploadResult = await uploadDirect(file, signedUrl.uploadUrl);
        return await processMetadata(uploadResult);
    } catch (error) {
        console.error('Error in uploadSinglePropertyImage:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al subir imagen');
    }
}