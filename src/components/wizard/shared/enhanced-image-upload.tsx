"use client";

import {
	AlertCircle,
	CheckCircle2,
	Eye,
	GripVertical,
	ImageIcon,
	Info,
	Loader2,
	RotateCcw,
	Upload,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
// import { uploadPropertyImages } from "@/lib/services/image-upload-service"; // TODO: Create service
import { cn } from "@/lib/utils";
import {
	formatFileSize,
	isFileSizeValid,
	isImageTypeSupported,
} from "@/lib/utils/image-utils";
import {
	isMobile,
	isTouchDevice,
	mobileClasses,
} from "@/lib/utils/mobile-utils";
import type { ImageMetadata } from "@/types/wizard";
import { ImagePreview } from "./image-preview-handler";

interface EnhancedImageUploadProps {
	images: ImageMetadata[];
	onImagesChange: (images: ImageMetadata[]) => void;
	maxImages?: number;
	maxFileSize?: number; // in bytes
	allowedTypes?: string[];
	disabled?: boolean;
	isMobile?: boolean;
}

interface UploadProgress {
	file: File;
	progress: number;
	status: "uploading" | "success" | "error";
	error?: string;
	result?: ImageMetadata;
}

interface ImageWithFile extends ImageMetadata {
	originalFile?: File;
}

export function EnhancedImageUpload({
	images,
	onImagesChange,
	maxImages = 20,
	maxFileSize = 10 * 1024 * 1024, // 10MB
	allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
	disabled = false,
	isMobile: propIsMobile,
}: EnhancedImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragCounter = useRef(0);

	// Detect mobile if not provided as prop
	const isMobileDevice =
		propIsMobile ?? (typeof window !== "undefined" && isMobile());
	const _isTouch = typeof window !== "undefined" && isTouchDevice();

	// Handle file validation
	const validateFiles = useCallback(
		(
			files: FileList | File[],
		): { valid: File[]; invalid: { file: File; reason: string }[] } => {
			const fileArray = Array.from(files);
			const valid: File[] = [];
			const invalid: { file: File; reason: string }[] = [];

			fileArray.forEach((file) => {
				if (!isImageTypeSupported(file)) {
					invalid.push({
						file,
						reason: `Tipo de archivo no válido: ${file.type}`,
					});
					return;
				}

				if (!isFileSizeValid(file, maxFileSize)) {
					invalid.push({
						file,
						reason: `Archivo demasiado grande: ${formatFileSize(file.size)}`,
					});
					return;
				}

				if (images.length + valid.length >= maxImages) {
					invalid.push({
						file,
						reason: `Máximo ${maxImages} imágenes permitidas`,
					});
					return;
				}

				valid.push(file);
			});

			return { valid, invalid };
		},
		[maxFileSize, maxImages, images.length],
	);

	// Handle file upload with progress tracking
	const handleFileUpload = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return;

			setIsUploading(true);

			// Initialize progress tracking
			const initialProgress: UploadProgress[] = files.map((file) => ({
				file,
				progress: 0,
				status: "uploading" as const,
			}));
			setUploadProgress(initialProgress);

			try {
				// Simulate progress updates (since Vercel Blob doesn't provide real progress)
				const progressInterval = setInterval(() => {
					setUploadProgress((prev) =>
						prev.map((item) =>
							item.status === "uploading"
								? {
										...item,
										progress: Math.min(item.progress + Math.random() * 20, 90),
									}
								: item,
						),
					);
				}, 500);

				// Upload files
				// TODO: Implement uploadPropertyImages service
				const result = { 
					successful: files.map(() => ({
						id: "placeholder-id",
						url: "/placeholder-image.jpg",
						filename: "placeholder.jpg",
						size: 1024,
						type: "image/jpeg",
						contentType: "image/jpeg",
						displayOrder: 0
					})),
					failed: [] as any[],
					urls: files.map(() => "/placeholder-image.jpg")
				};

				clearInterval(progressInterval);

				// Update progress with results
				const finalProgress: UploadProgress[] = [];
				let successIndex = 0;
				let failIndex = 0;

				files.forEach((file) => {
					if (successIndex < result.successful.length) {
						finalProgress.push({
							file,
							progress: 100,
							status: "success",
							result: result.successful[successIndex],
						});
						successIndex++;
					} else {
						const failedItem = result.failed[failIndex];
						finalProgress.push({
							file,
							progress: 0,
							status: "error",
							error: failedItem?.error || "Error desconocido",
						});
						failIndex++;
					}
				});

				setUploadProgress(finalProgress);

				// Update images with successful uploads, keeping original file reference
				if (result.successful.length > 0) {
					const newImages = [...images];
					result.successful.forEach((uploadedImage, index) => {
						const originalFile = files[index];
						newImages.push({
							...uploadedImage,
							originalFile,
						} as ImageWithFile);
					});
					onImagesChange(newImages);
					toast.success(
						`${result.successful.length} imagen(es) subida(s) exitosamente`,
					);
				}

				// Show errors for failed uploads
				if (result.failed.length > 0) {
					result.failed.forEach((failed) => {
						toast.error(`Error al subir ${failed.file.name}: ${failed.error}`);
					});
				}

				// Clear progress after 3 seconds
				setTimeout(() => {
					setUploadProgress([]);
				}, 3000);
			} catch (error) {
				console.error("Upload error:", error);
				toast.error("Error al subir imágenes");
				setUploadProgress((prev) =>
					prev.map((item) => ({
						...item,
						status: "error" as const,
						error: "Error de conexión",
						progress: 0,
					})),
				);
			} finally {
				setIsUploading(false);
			}
		},
		[images, onImagesChange],
	);

	// Handle files from input or drop
	const handleFiles = useCallback(
		async (files: FileList | File[]) => {
			if (disabled) return;

			const { valid, invalid } = validateFiles(files);

			// Show validation errors
			invalid.forEach(({ file, reason }) => {
				toast.error(`${file.name}: ${reason}`);
			});

			// Upload valid files
			if (valid.length > 0) {
				await handleFileUpload(valid);
			}
		},
		[validateFiles, handleFileUpload, disabled],
	);

	// Drag and drop handlers
	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDragIn = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragActive(true);
		}
	}, []);

	const handleDragOut = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);
			dragCounter.current = 0;

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				handleFiles(e.dataTransfer.files);
			}
		},
		[handleFiles],
	);

	// File input handler
	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				handleFiles(e.target.files);
				// Reset input value to allow selecting the same file again
				e.target.value = "";
			}
		},
		[handleFiles],
	);

	// Remove image
	const removeImage = useCallback(
		(index: number) => {
			const newImages = images.filter((_, i) => i !== index);
			onImagesChange(newImages);
			toast.success("Imagen eliminada");
		},
		[images, onImagesChange],
	);

	// Reorder images
	const _moveImage = useCallback(
		(fromIndex: number, toIndex: number) => {
			const newImages = [...images];
			const [movedImage] = newImages.splice(fromIndex, 1);
			newImages.splice(toIndex, 0, movedImage);

			// Update display order
			const updatedImages = newImages.map((img, index) => ({
				...img,
				displayOrder: index,
			}));

			onImagesChange(updatedImages);
		},
		[images, onImagesChange],
	);

	// Retry failed upload
	const retryUpload = useCallback(
		(file: File) => {
			handleFileUpload([file]);
		},
		[handleFileUpload],
	);

	return (
		<div className={cn(isMobileDevice ? "space-y-4" : "space-y-6")}>
			{/* Storage Status Info */}
			{images.length > 0 &&
				images.some((img) => img.url.includes("mock-storage.example.com")) && (
					<Alert className="border-blue-200 bg-blue-50">
						<Info className="h-4 w-4 text-blue-600" />
						<AlertDescription className="text-blue-800">
							<strong>Modo de desarrollo:</strong> Las imágenes se están
							guardando en almacenamiento simulado. Las vistas previas muestran
							los archivos originales. Para ver imágenes reales en producción,
							configura Vercel Blob siguiendo la guía en{" "}
							<code>BLOB_STORAGE_SETUP.md</code>.
						</AlertDescription>
					</Alert>
				)}

			{/* Upload Area */}
			<div
				className={cn(
					"border-2 border-dashed rounded-lg text-center transition-all duration-200",
					isMobileDevice ? "p-4" : "p-8",
					dragActive
						? "border-primary bg-primary/5 scale-[1.02]"
						: "border-border hover:border-primary/50",
					disabled && "opacity-50 cursor-not-allowed",
					isUploading && "pointer-events-none",
					// Disable drag on mobile since it interferes with scrolling
					isMobileDevice && "pointer-events-none",
				)}
				onDragEnter={!isMobileDevice ? handleDragIn : undefined}
				onDragLeave={!isMobileDevice ? handleDragOut : undefined}
				onDragOver={!isMobileDevice ? handleDrag : undefined}
				onDrop={!isMobileDevice ? handleDrop : undefined}
			>
				<div
					className={cn(
						"flex flex-col items-center",
						isMobileDevice ? "gap-3" : "gap-4",
					)}
				>
					<div
						className={cn(
							"rounded-full transition-colors",
							isMobileDevice ? "p-3" : "p-4",
							dragActive
								? "bg-primary text-primary-foreground"
								: "bg-primary/10 text-primary",
						)}
					>
						{isUploading ? (
							<Loader2
								className={cn(
									"animate-spin",
									isMobileDevice ? "h-6 w-6" : "h-8 w-8",
								)}
							/>
						) : (
							<Upload className={cn(isMobileDevice ? "h-6 w-6" : "h-8 w-8")} />
						)}
					</div>

					<div className={cn(isMobileDevice && "px-2")}>
						<p
							className={cn(
								"font-medium",
								isMobileDevice ? "text-base" : "text-lg",
							)}
						>
							{isUploading
								? "Subiendo imágenes..."
								: isMobileDevice
									? "Toca para seleccionar imágenes"
									: "Arrastra las imágenes aquí o haz clic para seleccionar"}
						</p>
						<p
							className={cn(
								"text-muted-foreground mt-1",
								isMobileDevice ? "text-xs" : "text-sm",
							)}
						>
							Máximo {maxImages} imágenes, hasta{" "}
							{(maxFileSize / 1024 / 1024).toFixed(0)}MB cada una
						</p>
						<p
							className={cn(
								"text-muted-foreground",
								isMobileDevice ? "text-xs" : "text-xs",
							)}
						>
							Formatos soportados: JPEG, PNG, WebP
						</p>
					</div>

					<Button
						type="button"
						variant="outline"
						disabled={disabled || isUploading}
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							isMobileDevice &&
								`${mobileClasses.touchButton} min-h-[48px] text-base`,
						)}
					>
						<ImageIcon
							className={cn("mr-2", isMobileDevice ? "h-5 w-5" : "h-4 w-4")}
						/>
						Seleccionar Imágenes
					</Button>

					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept={allowedTypes.join(",")}
						onChange={handleFileInputChange}
						className="hidden"
					/>
				</div>
			</div>

			{/* Upload Progress */}
			{uploadProgress.length > 0 && (
				<div className={cn(isMobileDevice ? "space-y-1" : "space-y-2")}>
					<h4
						className={cn(
							"font-medium",
							isMobileDevice ? "text-xs" : "text-sm",
						)}
					>
						Progreso de subida
					</h4>
					{uploadProgress.map((item, index) => (
						<Card key={index} className={cn(isMobileDevice ? "p-2" : "p-3")}>
							<div
								className={cn(
									"flex items-center",
									isMobileDevice ? "gap-2" : "gap-3",
								)}
							>
								<div className="flex-1">
									<div
										className={cn(
											"flex items-center justify-between",
											isMobileDevice ? "mb-0.5" : "mb-1",
										)}
									>
										<span
											className={cn(
												"font-medium truncate",
												isMobileDevice ? "text-xs" : "text-sm",
											)}
										>
											{item.file.name}
										</span>
										<div
											className={cn(
												"flex items-center",
												isMobileDevice ? "gap-1" : "gap-2",
											)}
										>
											{item.status === "uploading" && (
												<Loader2
													className={cn(
														"animate-spin text-blue-500",
														isMobileDevice ? "h-3 w-3" : "h-4 w-4",
													)}
												/>
											)}
											{item.status === "success" && (
												<CheckCircle2
													className={cn(
														"text-green-500",
														isMobileDevice ? "h-3 w-3" : "h-4 w-4",
													)}
												/>
											)}
											{item.status === "error" && (
												<>
													<AlertCircle
														className={cn(
															"text-red-500",
															isMobileDevice ? "h-3 w-3" : "h-4 w-4",
														)}
													/>
													<Button
														size={isMobileDevice ? "sm" : "sm"}
														variant="ghost"
														onClick={() => retryUpload(item.file)}
														className={cn(
															isMobileDevice && mobileClasses.touchButton,
														)}
													>
														<RotateCcw
															className={cn(
																isMobileDevice ? "h-3 w-3" : "h-3 w-3",
															)}
														/>
													</Button>
												</>
											)}
										</div>
									</div>

									{item.status === "uploading" && (
										<Progress
											value={item.progress}
											className={cn(isMobileDevice ? "h-1" : "h-2")}
										/>
									)}

									{item.status === "error" && item.error && (
										<p
											className={cn(
												"text-red-500",
												isMobileDevice ? "text-xs" : "text-xs",
											)}
										>
											{item.error}
										</p>
									)}
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Image Grid */}
			{images.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium">
							Imágenes subidas ({images.length}/{maxImages})
						</h4>
						<Badge variant="outline">
							{images.length} imagen{images.length !== 1 ? "es" : ""}
						</Badge>
					</div>

					<div
						className={cn(
							"gap-4",
							isMobileDevice
								? "grid grid-cols-2 gap-2"
								: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
						)}
					>
						{images.map((image, index) => (
							<Card key={image.id} className="group relative overflow-hidden">
								<CardContent className="p-0">
									<div className="aspect-square relative">
										<ImagePreview
											image={image}
											className="aspect-square w-full"
											onRemove={() => removeImage(index)}
										/>

										{/* Overlay with controls */}
										<div
											className={cn(
												"absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center",
												isMobileDevice
													? "opacity-100 gap-1" // Always visible on mobile
													: "opacity-0 group-hover:opacity-100 gap-2",
											)}
										>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														size={isMobileDevice ? "sm" : "sm"}
														variant="secondary"
														className={cn(
															isMobileDevice && mobileClasses.touchButton,
														)}
													>
														<Eye
															className={cn(
																isMobileDevice ? "h-3 w-3" : "h-4 w-4",
															)}
														/>
													</Button>
												</DialogTrigger>
												<DialogContent
													className={cn(
														isMobileDevice
															? "max-w-[95vw] max-h-[95vh]"
															: "max-w-3xl",
													)}
												>
													<div className="relative aspect-video">
														<ImagePreview
															image={image}
															className="w-full h-full"
															showControls={false}
														/>
													</div>
												</DialogContent>
											</Dialog>

											<Button
												size={isMobileDevice ? "sm" : "sm"}
												variant="destructive"
												onClick={() => removeImage(index)}
												className={cn(
													isMobileDevice && mobileClasses.touchButton,
												)}
											>
												<X
													className={cn(isMobileDevice ? "h-3 w-3" : "h-4 w-4")}
												/>
											</Button>
										</div>

										{/* Drag handle */}
										<div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<div className="bg-black/50 rounded p-1 cursor-move">
												<GripVertical className="h-4 w-4 text-white" />
											</div>
										</div>

										{/* Image order badge */}
										<div className="absolute top-2 right-2">
											<Badge variant="secondary" className="text-xs">
												{index + 1}
											</Badge>
										</div>
									</div>

									{/* Image info */}
									<div className={cn(isMobileDevice ? "p-1" : "p-2")}>
										<p
											className={cn(
												"text-muted-foreground truncate",
												isMobileDevice ? "text-xs" : "text-xs",
											)}
										>
											{image.filename}
										</p>
										<p
											className={cn(
												"text-muted-foreground",
												isMobileDevice ? "text-xs" : "text-xs",
											)}
										>
											{formatFileSize(image.size)}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Reorder instructions */}
					{images.length > 1 && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="text-sm">
								Arrastra las imágenes para reordenarlas. La primera imagen será
								la imagen principal.
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}

			{/* Empty state */}
			{images.length === 0 && !isUploading && (
				<div className="text-center py-8">
					<ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">No hay imágenes subidas aún</p>
				</div>
			)}
		</div>
	);
}
