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
import { cn } from "@/lib/utils";

export interface ImageMetadata {
	id: string;
	url: string;
	filename: string;
	size: number;
	contentType: string;
	displayOrder: number;
	alt?: string;
	caption?: string;
}

interface ImageUploadStepProps {
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
}

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
		{},
	);
	const [editingImage, setEditingImage] = useState<string | null>(null);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const newImages: ImageMetadata[] = [];

			for (const file of acceptedFiles) {
				// Validate file size
				if (file.size > maxFileSize * 1024 * 1024) {
					console.error(`File ${file.name} is too large`);
					continue;
				}

				// Validate file type
				if (!acceptedTypes.includes(file.type)) {
					console.error(`File ${file.name} has invalid type`);
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
				} catch (error) {
					console.error("Error uploading image:", error);
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
		[images, onImagesChange, maxFileSize, acceptedTypes],
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
		updates: Partial<ImageMetadata>,
	) => {
		const updatedImages = images.map((img) =>
			img.id === imageId ? { ...img, ...updates } : img,
		);
		onImagesChange(updatedImages);
	};

	const moveImage = (imageId: string, direction: "up" | "down") => {
		const currentIndex = images.findIndex((img) => img.id === imageId);
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= images.length) return;

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
				<h2 className="text-2xl font-bold mb-2">{title}</h2>
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
							"border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
							isDragActive
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25",
							images.length >= maxImages && "opacity-50 cursor-not-allowed",
						)}
					>
						<input {...getInputProps()} />
						<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						{isDragActive ? (
							<p>Suelta las imágenes aquí...</p>
						) : (
							<div>
								<p className="text-lg font-medium mb-2">
									{images.length >= maxImages
										? "Límite de imágenes alcanzado"
										: "Arrastra imágenes aquí o haz clic para seleccionar"}
								</p>
								<p className="text-sm text-muted-foreground">
									Formatos soportados: JPEG, PNG, WebP
								</p>
							</div>
						)}
					</div>

					{errors.images && (
						<div className="flex items-center gap-2 mt-2 text-sm text-destructive">
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
							<div key={imageId} className="space-y-1">
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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{images
								.sort((a, b) => a.displayOrder - b.displayOrder)
								.map((image, index) => (
									<div key={image.id} className="relative group">
										<div className="aspect-video bg-muted rounded-lg overflow-hidden">
											<img
												src={image.url}
												alt={image.alt || image.filename}
												className="w-full h-full object-cover"
											/>
										</div>

										{/* Image Controls */}
										<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												size="sm"
												variant="secondary"
												onClick={() => setEditingImage(image.id)}
											>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => removeImage(image.id)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>

										{/* Order Controls */}
										<div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												size="sm"
												variant="secondary"
												onClick={() => moveImage(image.id, "up")}
												disabled={index === 0}
											>
												<Move className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="secondary"
												onClick={() => moveImage(image.id, "down")}
												disabled={index === images.length - 1}
											>
												<Move className="h-3 w-3 rotate-180" />
											</Button>
										</div>

										{/* Image Info */}
										<div className="mt-2 space-y-2">
											<p className="text-sm font-medium truncate">
												{image.filename}
											</p>

											{editingImage === image.id && (
												<div className="space-y-2">
													{showAltText && (
														<div>
															<Label
																htmlFor={`alt-${image.id}`}
																className="text-xs"
															>
																Texto alternativo
															</Label>
															<Input
																id={`alt-${image.id}`}
																value={image.alt || ""}
																onChange={(e) =>
																	updateImageMetadata(image.id, {
																		alt: e.target.value,
																	})
																}
																placeholder="Describe la imagen"
																className="text-xs"
															/>
														</div>
													)}

													{showCaptions && (
														<div>
															<Label
																htmlFor={`caption-${image.id}`}
																className="text-xs"
															>
																Descripción
															</Label>
															<Input
																id={`caption-${image.id}`}
																value={image.caption || ""}
																onChange={(e) =>
																	updateImageMetadata(image.id, {
																		caption: e.target.value,
																	})
																}
																placeholder="Descripción opcional"
																className="text-xs"
															/>
														</div>
													)}

													<Button
														size="sm"
														onClick={() => setEditingImage(null)}
														className="w-full"
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
