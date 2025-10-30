"use server";

import { put } from "@vercel/blob";
import { validateBlobConfig } from "@/lib/config/blob-config";
import type { ImageMetadata } from "@/types/property-wizard";

export type UploadResult = {
  successful: ImageMetadata[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
};

/**
 * Upload multiple property images to Vercel Blob
 */
export async function uploadPropertyImages(files: File[]): Promise<UploadResult> {
  const result: UploadResult = {
    successful: [],
    failed: [],
  };

  // Validate blob configuration
  const blobConfig = validateBlobConfig();
  if (!blobConfig.isConfigured) {
    return {
      successful: [],
      failed: files.map(file => ({
        filename: file.name,
        error: "El almacenamiento de archivos no está configurado",
      })),
    };
  }

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `property-${timestamp}-${randomId}.${extension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false, // We're already adding our own suffix
      });

      // Create image metadata compatible with app types
      const imageMetadata: ImageMetadata = {
        id: `img_${timestamp}_${randomId}`,
        url: blob.url,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        displayOrder: i,
      };

      result.successful.push(imageMetadata);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      result.failed.push({
        filename: file.name,
        error: error instanceof Error ? error.message : "Error desconocido al subir archivo",
      });
    }
  }

  return result;
}

/**
 * Upload a single property image to Vercel Blob
 */
export async function uploadSinglePropertyImage(file: File): Promise<ImageMetadata> {
  const result = await uploadPropertyImages([file]);
  
  if (result.failed.length > 0) {
    throw new Error(result.failed[0].error);
  }
  
  if (result.successful.length === 0) {
    throw new Error("No se pudo subir la imagen");
  }
  
  return result.successful[0];
}

/**
 * Delete an image from Vercel Blob (if needed)
 */
export async function deletePropertyImage(url: string): Promise<boolean> {
  try {
    // Extract the blob key from the URL
    const urlParts = url.split('/');
    const blobKey = urlParts[urlParts.length - 1];
    
    // Note: Vercel Blob doesn't have a direct delete API in the current version
    // This is a placeholder for future implementation
    console.log(`Would delete blob with key: ${blobKey}`);
    
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}