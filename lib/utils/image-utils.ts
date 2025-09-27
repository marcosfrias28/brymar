/**
 * Client-side image utilities for the wizard
 */

/**
 * Validate image dimensions (client-side helper)
 */
export function validateImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo cargar la imagen para validar dimensiones'));
        };

        img.src = url;
    });
}

/**
 * Compress image if needed (optional enhancement)
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Error al comprimir imagen'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error('Error al cargar imagen para compresión'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generate thumbnail for preview
 */
export function generateThumbnail(file: File, size: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = size;
            canvas.height = size;

            // Calculate crop dimensions for square thumbnail
            const { width, height } = img;
            const minDimension = Math.min(width, height);
            const x = (width - minDimension) / 2;
            const y = (height - minDimension) / 2;

            ctx?.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size);

            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(thumbnailUrl);
        };

        img.onerror = () => reject(new Error('Error al generar thumbnail'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isImageTypeSupported(file: File): boolean {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return supportedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isFileSizeValid(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
    return file.size <= maxSize;
}