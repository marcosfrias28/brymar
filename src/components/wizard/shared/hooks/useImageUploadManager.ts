import { useCallback, useRef } from "react";
import { toast } from "sonner";
import type { ImageMetadata } from "@/types/wizard";
import { useFileValidation } from "./useFileValidation";
import { useFileUpload, type UploadProgress } from "./useFileUpload";
import { useDragAndDrop } from "./useDragAndDrop";

type UseImageUploadManagerProps = {
	images: ImageMetadata[];
	onImagesChange: (images: ImageMetadata[]) => void;
	maxImages: number;
	maxFileSize: number;
	allowedTypes: string[];
	disabled: boolean;
	isMobileDevice: boolean;
};

type UseImageUploadManagerReturn = {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	dragActive: boolean;
	uploadProgress: UploadProgress[];
	isUploading: boolean;
	handleDrag: (e: React.DragEvent) => void;
	handleDragIn: (e: React.DragEvent) => void;
	handleDragOut: (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	removeImage: (index: number) => void;
	handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	retryUpload: (file: File) => void;
};

// Helper functions to reduce hook complexity
const createHandleFiles = (
	validateFiles: (files: FileList | File[]) => {
		valid: File[];
		invalid: { file: File; reason: string }[];
	},
	handleFileUpload: (files: File[]) => Promise<void>,
	disabled: boolean
) => {
	return useCallback(
		async (files: FileList | File[]) => {
			if (disabled) {
				return;
			}

			const { valid, invalid } = validateFiles(files);

			// Show validation errors
			for (const { file, reason } of invalid) {
				toast.error(`${file.name}: ${reason}`);
			}

			// Upload valid files
			if (valid.length > 0) {
				await handleFileUpload(valid);
			}
		},
		[validateFiles, handleFileUpload, disabled]
	);
};

const createRemoveImage = (
	currentImages: ImageMetadata[],
	onImagesChange: (images: ImageMetadata[]) => void
) =>
	useCallback(
		(index: number) => {
			const newImages = currentImages.filter((_, i) => i !== index);
			onImagesChange(newImages);
			toast.success("Imagen eliminada");
		},
		[currentImages, onImagesChange]
	);

const createHandleFileInputChange = (
	handleFiles: (files: FileList | File[]) => Promise<void>
) => {
	return useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				handleFiles(e.target.files);
				// Reset input value to allow selecting the same file again
				e.target.value = "";
			}
		},
		[handleFiles]
	);
};

export function useImageUploadManager({
	images,
	onImagesChange,
	maxImages,
	maxFileSize,
	allowedTypes: _allowedTypes,
	disabled,
	isMobileDevice,
}: UseImageUploadManagerProps): UseImageUploadManagerReturn {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// Custom hooks
	const { validateFiles } = useFileValidation(images, maxFileSize, maxImages);
	const { uploadProgress, isUploading, handleFileUpload, retryUpload } =
		useFileUpload(images, onImagesChange);

	// Handle files from input or drop
	const handleFiles = createHandleFiles(
		validateFiles,
		handleFileUpload,
		disabled
	);

	const { dragActive, handleDrag, handleDragIn, handleDragOut, handleDrop } =
		useDragAndDrop(handleFiles, isMobileDevice);

	// Remove image
	const removeImage = createRemoveImage(images, onImagesChange);

	// File input handler
	const handleFileInputChange = createHandleFileInputChange(handleFiles);

	return {
		fileInputRef,
		dragActive,
		uploadProgress,
		isUploading,
		handleDrag,
		handleDragIn,
		handleDragOut,
		handleDrop,
		removeImage,
		handleFileInputChange,
		retryUpload,
	};
}
