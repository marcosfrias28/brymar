import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadPropertyImages } from "@/lib/services/image-upload-service";
import type { ImageMetadata } from "@/types/wizard";

export type UploadProgress = {
	file: File;
	progress: number;
	status: "uploading" | "success" | "error";
	error?: string;
	result?: ImageMetadata;
};

type ImageWithFile = ImageMetadata & {
	originalFile?: File;
};

const PROGRESS_INCREMENT_MAX = 20;
const PROGRESS_MAX = 90;
const PROGRESS_UPDATE_INTERVAL = 1000;
const CLEAR_PROGRESS_DELAY = 3000;

const simulateProgress = (
	setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>
) =>
	setInterval(() => {
		setUploadProgress((previousProgress) =>
			previousProgress.map((item) => {
				if (item.status === "uploading") {
					return {
						...item,
						progress: Math.min(
							item.progress + Math.random() * PROGRESS_INCREMENT_MAX,
							PROGRESS_MAX
						),
					};
				}

				return item;
			})
		);
	}, PROGRESS_UPDATE_INTERVAL);

const createFinalProgress = (
	files: File[],
	result: Awaited<ReturnType<typeof uploadPropertyImages>>
): UploadProgress[] => {
	const finalProgress: UploadProgress[] = [];
	let successIndex = 0;
	let failIndex = 0;

	for (const file of files) {
		if (successIndex < result.successful.length) {
			finalProgress.push({
				file,
				progress: 100,
				status: "success",
				result: result.successful[successIndex],
			});
			successIndex += 1;
		} else {
			const failedItem = result.failed[failIndex];
			finalProgress.push({
				file,
				progress: 0,
				status: "error",
				error: failedItem?.error || "Error desconocido",
			});
			failIndex += 1;
		}
	}

	return finalProgress;
};

const updateImagesWithSuccessfulUploads = (
	currentImages: ImageMetadata[],
	result: Awaited<ReturnType<typeof uploadPropertyImages>>,
	files: File[],
	handleImagesChange: (images: ImageMetadata[]) => void
) => {
	if (result.successful.length === 0) {
		return;
	}

	const newImages = [...currentImages];
	for (const [index, uploadedImage] of result.successful.entries()) {
		const originalFile = files[index];
		newImages.push({
			...uploadedImage,
			originalFile,
		} as ImageWithFile);
	}
	handleImagesChange(newImages);
	toast.success(`${result.successful.length} imagen(es) subida(s) exitosamente`);
};

const showUploadErrors = (result: Awaited<ReturnType<typeof uploadPropertyImages>>) => {
	for (const failed of result.failed) {
		toast.error(`Error al subir ${failed.filename}: ${failed.error}`);
	}
};

const handleUploadError = (
	setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>
) => {
	toast.error("Error al subir imágenes");
	setUploadProgress((previousProgress) =>
		previousProgress.map((item) => ({
			...item,
			status: "error" as const,
			error: "Error de conexión",
			progress: 0,
		}))
	);
};

const initializeProgress = (
	files: File[],
	setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>
) => {
	const initialProgress: UploadProgress[] = files.map((file) => ({
		file,
		progress: 0,
		status: "uploading" as const,
	}));
	setUploadProgress(initialProgress);
};

const uploadWithProgress = async (
	files: File[],
	setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>
) => {
	const progressInterval = simulateProgress(setUploadProgress);
	try {
		const result = await uploadPropertyImages(files);
		const finalProgress = createFinalProgress(files, result);
		setUploadProgress(finalProgress);

		return result;
	} finally {
		clearInterval(progressInterval);
	}
};

const scheduleProgressClear = (
	setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>
) => {
	setTimeout(() => {
		setUploadProgress([]);
	}, CLEAR_PROGRESS_DELAY);
};

export const useFileUpload = (
	images: ImageMetadata[],
	onImagesChange: (images: ImageMetadata[]) => void
) => {
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileUpload = useCallback(
		async (files: File[]) => {
			if (files.length === 0) {
				return;
			}

			setIsUploading(true);
			initializeProgress(files, setUploadProgress);

			try {
				const result = await uploadWithProgress(files, setUploadProgress);
				updateImagesWithSuccessfulUploads(images, result, files, onImagesChange);
				showUploadErrors(result);
				scheduleProgressClear(setUploadProgress);
			} catch (_error) {
				handleUploadError(setUploadProgress);
			} finally {
				setIsUploading(false);
			}
		},
		[images, onImagesChange]
	);

	const retryUpload = useCallback(
		(file: File) => {
			handleFileUpload([file]);
		},
		[handleFileUpload]
	);

	return {
		uploadProgress,
		isUploading,
		handleFileUpload,
		retryUpload,
	};
};
