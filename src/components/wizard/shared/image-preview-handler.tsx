/**
 * Image Preview Handler Component
 *
 * Provides image preview functionality with optimization,
 * cropping, and metadata handling for wizard components.
 */

import { Download, Edit, Eye, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ImageMetadata } from "@/types/property-wizard";

type ImagePreviewProps = {
	image: ImageMetadata;
	onRemove?: (imageId: string) => void;
	onEdit?: (imageId: string) => void;
	onReorder?: (imageId: string, newOrder: number) => void;
	showControls?: boolean;
	className?: string;
};

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
		if (bytes === 0) {
			return "0 Bytes";
		}
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<Card className={`group relative ${className}`}>
			<CardContent className="p-2">
				<div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
					{hasError ? (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<div className="text-center">
								<X className="mx-auto mb-2 h-8 w-8" />
								<p className="text-sm">Error al cargar</p>
							</div>
						</div>
					) : (
						<Image
							alt={`Preview ${image.filename}`}
							className="object-cover transition-transform group-hover:scale-105"
							fill
							onError={handleImageError}
							onLoad={handleImageLoad}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							src={image.url}
						/>
					)}

					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-muted">
							<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						</div>
					)}

					{showControls && !isLoading && !hasError && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
							<div className="flex space-x-2">
								<Button
									onClick={() => window.open(image.url, "_blank")}
									size="sm"
									variant="secondary"
								>
									<Eye className="h-4 w-4" />
								</Button>
								{onEdit && (
									<Button
										onClick={() => onEdit(image.id)}
										size="sm"
										variant="secondary"
									>
										<Edit className="h-4 w-4" />
									</Button>
								)}
								<Button
									onClick={() => {
										const link = document.createElement("a");
										link.href = image.url;
										link.download = image.filename;
										link.click();
									}}
									size="sm"
									variant="secondary"
								>
									<Download className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}

					{onRemove && (
						<Button
							className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
							onClick={() => onRemove(image.id)}
							size="sm"
							variant="destructive"
						>
							<X className="h-3 w-3" />
						</Button>
					)}

					{image.displayOrder !== undefined && (
						<Badge className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center p-0">
							{image.displayOrder + 1}
						</Badge>
					)}
				</div>

				<div className="mt-2 space-y-1">
					<p className="truncate font-medium text-xs" title={image.filename}>
						{image.filename}
					</p>
					<div className="flex justify-between text-muted-foreground text-xs">
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

type ImagePreviewGridProps = {
	images: ImageMetadata[];
	onRemove?: (imageId: string) => void;
	onEdit?: (imageId: string) => void;
	onReorder?: (images: ImageMetadata[]) => void;
	maxImages?: number;
	className?: string;
};

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
			if (!onReorder) {
				return;
			}

			const currentIndex = images.findIndex((img) => img.id === imageId);
			if (currentIndex === -1) {
				return;
			}

			const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
			if (newIndex < 0 || newIndex >= images.length) {
				return;
			}

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
			<div className="py-8 text-center text-muted-foreground">
				<p>No hay imágenes para mostrar</p>
			</div>
		);
	}

	return (
		<div
			className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${className}`}
		>
			{images.map((image, index) => (
				<div className="relative" key={image.id}>
					<ImagePreview
						image={image}
						onEdit={onEdit}
						onRemove={onRemove}
						showControls={true}
					/>

					{onReorder && images.length > 1 && (
						<div className="-bottom-2 -translate-x-1/2 absolute left-1/2 flex transform space-x-1">
							<Button
								className="h-6 w-6 p-0"
								disabled={index === 0}
								onClick={() => handleReorder(image.id, "up")}
								size="sm"
								variant="outline"
							>
								<RotateCw className="h-3 w-3 rotate-180" />
							</Button>
							<Button
								className="h-6 w-6 p-0"
								disabled={index === images.length - 1}
								onClick={() => handleReorder(image.id, "down")}
								size="sm"
								variant="outline"
							>
								<RotateCw className="h-3 w-3" />
							</Button>
						</div>
					)}
				</div>
			))}

			{maxImages && images.length >= maxImages && (
				<div className="col-span-full py-4 text-center text-muted-foreground">
					<p className="text-sm">Máximo de {maxImages} imágenes alcanzado</p>
				</div>
			)}
		</div>
	);
}
