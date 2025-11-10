import { useCallback } from "react";
import { formatFileSize, isFileSizeValid, isImageTypeSupported } from "@/lib/utils/image-utils";
import type { ImageMetadata } from "@/types/wizard";

export const useFileValidation = (
	images: ImageMetadata[],
	maxFileSize: number,
	maxImages: number
) => {
	const validateFiles = useCallback(
		(
			files: FileList | File[]
		): { valid: File[]; invalid: { file: File; reason: string }[] } => {
			const fileArray = Array.from(files);
			const valid: File[] = [];
			const invalid: { file: File; reason: string }[] = [];

			for (const file of fileArray) {
				if (!isImageTypeSupported(file)) {
					invalid.push({
						file,
						reason: `Tipo de archivo no válido: ${file.type}`,
					});
					continue;
				}

				if (!isFileSizeValid(file, maxFileSize)) {
					invalid.push({
						file,
						reason: `Archivo demasiado grande: ${formatFileSize(file.size)}`,
					});
					continue;
				}

				if (images.length + valid.length >= maxImages) {
					invalid.push({
						file,
						reason: `Máximo ${maxImages} imágenes permitidas`,
					});
					continue;
				}

				valid.push(file);
			}

			return { valid, invalid };
		},
		[maxFileSize, maxImages, images.length]
	);

	return { validateFiles };
};
