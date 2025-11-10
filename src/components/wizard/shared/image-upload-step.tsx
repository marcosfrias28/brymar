"use client";

import {
	AlertCircle,
	Edit,
	Image as ImageIcon,
	Move,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/index";

export type ImageMetadata = {
	id: string;
	url: string;
	filename: string;
	size: number;
	contentType: string;
	displayOrder: number;
	alt?: string;
	caption?: string;
};

type ImageUploadStepProps = {
	images: ImageMetadata[];
	onImagesChange: (images: ImageMetadata[]) => void;
	maxImages?: number;
	maxFileSize?: number; // in MB
	acceptedTypes?: string[];
	title?: string;
	description?: string;
	showCaptions?: boolean;
	showAltText?: boolean;
	errors?: Record<string, string>;
};

export function ImageUploadStep({
	images = [],
	onImagesChange,
	maxImages = 15,
	maxFileSize = 10,
	acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
	title = "Imágenes",
	description = "Sube imágenes para mostrar tu propiedad",
	showCaptions = true,
	showAltText = false,
	errors = {},
}: ImageUploadStepProps) {
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
		{}
	);
	const [editingImage, setEditingImage] = useState<string | null>(null);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const newImages: ImageMetadata[] = [];

			for (const file of acceptedFiles) {
				// Validate file size
				if (file.size > maxFileSize * 1024 * 1024) {
					continue;
				}

				// Validate file type
				if (!acceptedTypes.includes(file.type)) {
					continue;
				}

				const imageId = `img_${Date.now()}_${Math.random()
					.toString(36)
					.substr(2, 9)}`;

				// Start upload progress
				setUploadProgress((prev) => ({ ...prev, [imageId]: 0 }));

				try {
					// Simulate upload progress
					const progressInterval = setInterval(() => {
						setUploadProgress((prev) => {
							const current = prev[imageId] || 0;
							if (current >= 90) {
								clearInterval(progressInterval);
								return prev;
							}
							return { ...prev, [imageId]: current + 10 };
						});
					}, 100);

					// Create object URL for preview
					const url = URL.createObjectURL(file);

					const newImage: ImageMetadata = {
						id: imageId,
						url,
						filename: file.name,
						size: file.size,
						contentType: file.type,
						displayOrder: images.length + newImages.length,
						alt: "",
						caption: "",
					};

					newImages.push(newImage);

					// Complete upload
					setTimeout(() => {
						setUploadProgress((prev) => ({ ...prev, [imageId]: 100 }));
						setTimeout(() => {
							setUploadProgress((prev) => {
								const { [imageId]: _, ...rest } = prev;
								return rest;
							});
						}, 500);
					}, 1000);
				} catch (_error) {
					setUploadProgress((prev) => {
						const { [imageId]: _, ...rest } = prev;
						return rest;
					});
				}
			}

			if (newImages.length > 0) {
				onImagesChange([...images, ...newImages]);
			}
		},
		[images, onImagesChange, maxFileSize, acceptedTypes]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
		maxFiles: maxImages - images.length,
		disabled: images.length >= maxImages,
	});

	const removeImage = (imageId: string) => {
		const updatedImages = images.filter((img) => img.id !== imageId);
		// Reorder remaining images
		const reorderedImages = updatedImages.map((img, index) => ({
			...img,
			displayOrder: index,
		}));
		onImagesChange(reorderedImages);
	};

	const updateImageMetadata = (
		imageId: string,
		updates: Partial<ImageMetadata>
	) => {
		const updatedImages = images.map((img) =>
			img.id === imageId ? { ...img, ...updates } : img
		);
		onImagesChange(updatedImages);
	};

	const moveImage = (imageId: string, direction: "up" | "down") => {
		const currentIndex = images.findIndex((img) => img.id === imageId);
		if (currentIndex === -1) {
			return;
		}

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= images.length) {
			return;
		}

		const updatedImages = [...images];
		[updatedImages[currentIndex], updatedImages[newIndex]] = [
			updatedImages[newIndex],
			updatedImages[currentIndex],
		];

		// Update display orders
		const reorderedImages = updatedImages.map((img, index) => ({
			...img,
			displayOrder: index,
		}));

		onImagesChange(reorderedImages);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 font-bold text-2xl">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			{/* Upload Area */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Subir Imágenes
					</CardTitle>
					<CardDescription>
						Arrastra y suelta imágenes aquí o haz clic para seleccionar (Máximo{" "}
						{maxImages} imágenes, {maxFileSize}MB cada una)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						{...getRootProps()}
						className={cn(
							"cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
							isDragActive
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25",
							images.length >= maxImages && "cursor-not-allowed opacity-50"
						)}
					>
						<input {...getInputProps()} />
						<Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						{isDragActive ? (
							<p>Suelta las imágenes aquí...</p>
						) : (
							<div>
								<p className="mb-2 font-medium text-lg">
									{images.length >= maxImages
										? "Límite de imágenes alcanzado"
										: "Arrastra imágenes aquí o haz clic para seleccionar"}
								</p>
								<p className="text-muted-foreground text-sm">
									Formatos soportados: JPEG, PNG, WebP
								</p>
							</div>
						)}
					</div>

					{errors.images && (
						<div className="mt-2 flex items-center gap-2 text-destructive text-sm">
							<AlertCircle className="h-4 w-4" />
							{errors.images}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Upload Progress */}
			{Object.keys(uploadProgress).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Subiendo Imágenes</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{Object.entries(uploadProgress).map(([imageId, progress]) => (
							<div className="space-y-1" key={imageId}>
								<div className="flex justify-between text-sm">
									<span>Subiendo imagen...</span>
									<span>{progress}%</span>
								</div>
								<Progress value={progress} />
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Image Gallery */}
			{images.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<ImageIcon className="h-5 w-5" />
								Imágenes Subidas ({images.length}/{maxImages})
							</span>
							{images.length > 0 && (
								<Badge variant="secondary">
									{images.length} imagen{images.length !== 1 ? "es" : ""}
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-2">
							{images
								.sort((a, b) => a.displayOrder - b.displayOrder)
								.map((image, index) => (
									<div className="group relative" key={image.id}>
										<div className="aspect-video overflow-hidden rounded-lg bg-muted">
											<img
												alt={image.alt || image.filename}
												className="h-full w-full object-cover"
												src={image.url}
											/>
										</div>

										{/* Image Controls */}
										<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
											<Button
												onClick={() => setEditingImage(image.id)}
												size="sm"
												variant="secondary"
											>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												onClick={() => removeImage(image.id)}
												size="sm"
												variant="destructive"
											>
												<X className="h-3 w-3" />
											</Button>
										</div>

										{/* Order Controls */}
										<div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
											<Button
												disabled={index === 0}
												onClick={() => moveImage(image.id, "up")}
												size="sm"
												variant="secondary"
											>
												<Move className="h-3 w-3" />
											</Button>
											<Button
												disabled={index === images.length - 1}
												onClick={() => moveImage(image.id, "down")}
												size="sm"
												variant="secondary"
											>
												<Move className="h-3 w-3 rotate-180" />
											</Button>
										</div>

										{/* Image Info */}
										<div className="mt-2 space-y-2">
											<p className="truncate font-medium text-sm">
												{image.filename}
											</p>

											{editingImage === image.id && (
												<div className="space-y-2">
													{showAltText && (
														<div>
															<Label
																className="text-xs"
																htmlFor={`alt-${image.id}`}
															>
																Texto alternativo
															</Label>
															<Input
																className="text-xs"
																id={`alt-${image.id}`}
																onChange={(e) =>
																	updateImageMetadata(image.id, {
																		alt: e.target.value,
																	})
																}
																placeholder="Describe la imagen"
																value={image.alt || ""}
															/>
														</div>
													)}

													{showCaptions && (
														<div>
															<Label
																className="text-xs"
																htmlFor={`caption-${image.id}`}
															>
																Descripción
															</Label>
															<Input
																className="text-xs"
																id={`caption-${image.id}`}
																onChange={(e) =>
																	updateImageMetadata(image.id, {
																		caption: e.target.value,
																	})
																}
																placeholder="Descripción opcional"
																value={image.caption || ""}
															/>
														</div>
													)}

													<Button
														className="w-full"
														onClick={() => setEditingImage(null)}
														size="sm"
													>
														Guardar
													</Button>
												</div>
											)}
										</div>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
