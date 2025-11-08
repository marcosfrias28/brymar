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
import {
	formatFileSize,
	isFileSizeValid,
	isImageTypeSupported,
} from "@/lib/utils/image-utils";
// import { uploadPropertyImages } from "@/lib/services/image-upload-service"; // TODO: Create service
import { cn } from "@/lib/utils/index";
import {
	isMobile,
	isTouchDevice,
	mobileClasses,
} from "@/lib/utils/mobile-utils";
import type { ImageMetadata } from "@/types/wizard";
import { ImagePreview } from "./image-preview-handler";

type EnhancedImageUploadProps = {
	images: ImageMetadata[];
	onImagesChange: (images: ImageMetadata[]) => void;
	maxImages?: number;
	maxFileSize?: number; // in bytes
	allowedTypes?: string[];
	disabled?: boolean;
	isMobile?: boolean;
};

type UploadProgress = {
	file: File;
	progress: number;
	status: "uploading" | "success" | "error";
	error?: string;
	result?: ImageMetadata;
};

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
			if (files.length === 0) {
				return;
			}

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

				// Upload files using the real service
				const result = await uploadPropertyImages(files);

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
						toast.error(`Error al subir ${failed.filename}: ${failed.error}`);
					});
				}

				// Clear progress after 3 seconds
				setTimeout(() => {
					setUploadProgress([]);
				}, 3000);
			} catch (_error) {
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
			if (disabled) {
				return;
			}

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
					"rounded-lg border-2 border-dashed text-center transition-all duration-200",
					isMobileDevice ? "p-4" : "p-8",
					dragActive
						? "scale-[1.02] border-primary bg-primary/5"
						: "border-border hover:border-primary/50",
					disabled && "cursor-not-allowed opacity-50",
					isUploading && "pointer-events-none",
					// Disable drag on mobile since it interferes with scrolling
					isMobileDevice && "pointer-events-none",
				)}
				onDragEnter={isMobileDevice ? undefined : handleDragIn}
				onDragLeave={isMobileDevice ? undefined : handleDragOut}
				onDragOver={isMobileDevice ? undefined : handleDrag}
				onDrop={isMobileDevice ? undefined : handleDrop}
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
								"mt-1 text-muted-foreground",
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
						className={cn(
							isMobileDevice &&
								`${mobileClasses.touchButton} min-h-[48px] text-base`,
						)}
						disabled={disabled || isUploading}
						onClick={() => fileInputRef.current?.click()}
						type="button"
						variant="outline"
					>
						<ImageIcon
							className={cn("mr-2", isMobileDevice ? "h-5 w-5" : "h-4 w-4")}
						/>
						Seleccionar Imágenes
					</Button>

					<input
						accept={allowedTypes.join(",")}
						className="hidden"
						multiple
						onChange={handleFileInputChange}
						ref={fileInputRef}
						type="file"
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
						<Card className={cn(isMobileDevice ? "p-2" : "p-3")} key={index}>
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
												"truncate font-medium",
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
														className={cn(
															isMobileDevice && mobileClasses.touchButton,
														)}
														onClick={() => retryUpload(item.file)}
														size={isMobileDevice ? "sm" : "sm"}
														variant="ghost"
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
											className={cn(isMobileDevice ? "h-1" : "h-2")}
											value={item.progress}
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
						<h4 className="font-medium text-sm">
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
							<Card className="group relative overflow-hidden" key={image.id}>
								<CardContent className="p-0">
									<div className="relative aspect-square">
										<ImagePreview
											className="aspect-square w-full"
											image={image}
											onRemove={() => removeImage(index)}
										/>

										{/* Overlay with controls */}
										<div
											className={cn(
												"absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
												isMobileDevice
													? "gap-1 opacity-100" // Always visible on mobile
													: "gap-2 opacity-0 group-hover:opacity-100",
											)}
										>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														className={cn(
															isMobileDevice && mobileClasses.touchButton,
														)}
														size={isMobileDevice ? "sm" : "sm"}
														variant="secondary"
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
															? "max-h-[95vh] max-w-[95vw]"
															: "max-w-3xl",
													)}
												>
													<div className="relative aspect-video">
														<ImagePreview
															className="h-full w-full"
															image={image}
															showControls={false}
														/>
													</div>
												</DialogContent>
											</Dialog>

											<Button
												className={cn(
													isMobileDevice && mobileClasses.touchButton,
												)}
												onClick={() => removeImage(index)}
												size={isMobileDevice ? "sm" : "sm"}
												variant="destructive"
											>
												<X
													className={cn(isMobileDevice ? "h-3 w-3" : "h-4 w-4")}
												/>
											</Button>
										</div>

										{/* Drag handle */}
										<div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
											<div className="cursor-move rounded bg-black/50 p-1">
												<GripVertical className="h-4 w-4 text-white" />
											</div>
										</div>

										{/* Image order badge */}
										<div className="absolute top-2 right-2">
											<Badge className="text-xs" variant="secondary">
												{index + 1}
											</Badge>
										</div>
									</div>

									{/* Image info */}
									<div className={cn(isMobileDevice ? "p-1" : "p-2")}>
										<p
											className={cn(
												"truncate text-muted-foreground",
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
				<div className="py-8 text-center">
					<ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<p className="text-muted-foreground">No hay imágenes subidas aún</p>
				</div>
			)}
		</div>
	);
}
