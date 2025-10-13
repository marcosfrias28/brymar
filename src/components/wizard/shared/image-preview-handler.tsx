/**
 * Image Preview Handler Component
 *
 * Provides image preview functionality with optimization,
 * cropping, and metadata handling for wizard components.
 */

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Eye, Download, Edit, RotateCw } from "lucide-react";
import { ImageMetadata } from '@/types/property-wizard';

interface ImagePreviewProps {
  image: ImageMetadata;
  onRemove?: (imageId: string) => void;
  onEdit?: (imageId: string) => void;
  onReorder?: (imageId: string, newOrder: number) => void;
  showControls?: boolean;
  className?: string;
}

export function ImagePreview({
  image,
  onRemove,
  onEdit,
  onReorder,
  showControls = true,
  className,
}: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className={`relative group ${className}`}>
      <CardContent className="p-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {!hasError ? (
            <Image
              src={image.url}
              alt={`Preview ${image.filename}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <X className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Error al cargar</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {showControls && !isLoading && !hasError && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(image.url, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(image.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = image.url;
                    link.download = image.filename;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {onRemove && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(image.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {image.displayOrder !== undefined && (
            <Badge className="absolute top-2 left-2 h-6 w-6 p-0 flex items-center justify-center">
              {image.displayOrder + 1}
            </Badge>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium truncate" title={image.filename}>
            {image.filename}
          </p>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(image.size)}</span>
            {image.width && image.height && (
              <span>
                {image.width} × {image.height}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ImagePreviewGridProps {
  images: ImageMetadata[];
  onRemove?: (imageId: string) => void;
  onEdit?: (imageId: string) => void;
  onReorder?: (images: ImageMetadata[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImagePreviewGrid({
  images,
  onRemove,
  onEdit,
  onReorder,
  maxImages,
  className,
}: ImagePreviewGridProps) {
  const handleReorder = useCallback(
    (imageId: string, direction: "up" | "down") => {
      if (!onReorder) return;

      const currentIndex = images.findIndex((img) => img.id === imageId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= images.length) return;

      const newImages = [...images];
      [newImages[currentIndex], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[currentIndex],
      ];

      // Update display order
      newImages.forEach((img, index) => {
        img.displayOrder = index;
      });

      onReorder(newImages);
    },
    [images, onReorder]
  );

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay imágenes para mostrar</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
    >
      {images.map((image, index) => (
        <div key={image.id} className="relative">
          <ImagePreview
            image={image}
            onRemove={onRemove}
            onEdit={onEdit}
            showControls={true}
          />

          {onReorder && images.length > 1 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleReorder(image.id, "up")}
                disabled={index === 0}
              >
                <RotateCw className="h-3 w-3 rotate-180" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleReorder(image.id, "down")}
                disabled={index === images.length - 1}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {maxImages && images.length >= maxImages && (
        <div className="col-span-full text-center py-4 text-muted-foreground">
          <p className="text-sm">Máximo de {maxImages} imágenes alcanzado</p>
        </div>
      )}
    </div>
  );
}
