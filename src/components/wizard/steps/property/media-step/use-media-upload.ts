import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PropertyWizardData } from "../types";
import { createRemoveImage, createRemoveVideo } from "./media-handlers";

const UPLOAD_DELAY = 1000;
const FILE_EXTENSION_REGEX = /\.[^/.]+$/;

type ImageFile = {
	url: string;
	filename: string;
	size: number;
	contentType: string;
};

type Video = {
	url: string;
	title?: string;
};

function processImageFiles(files: File[]): Promise<ImageFile[]> {
	const uploadPromises = files.map(async (file) => {
		await new Promise((resolve) => setTimeout(resolve, UPLOAD_DELAY));

		return {
			url: URL.createObjectURL(file),
			filename: file.name,
			size: file.size,
			contentType: file.type,
		} as ImageFile;
	});

	return Promise.all(uploadPromises);
}

function processVideoFiles(files: File[]): Promise<Video[]> {
	const uploadPromises = files.map(async (file) => {
		await new Promise((resolve) => setTimeout(resolve, UPLOAD_DELAY));

		return {
			url: URL.createObjectURL(file),
			title: file.name.replace(FILE_EXTENSION_REGEX, ""),
		};
	});

	return Promise.all(uploadPromises);
}

export function useMediaUpload(form: UseFormReturn<PropertyWizardData>) {
	const [isUploading, setIsUploading] = useState(false);

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files) {
			return;
		}

		setIsUploading(true);
		try {
			const newImages = await processImageFiles(Array.from(files));
			const current = form.getValues("images") || [];
			form.setValue("images", [...current, ...newImages], {
				shouldValidate: true,
			});
		} catch (_error) {
			// Handle error
		} finally {
			setIsUploading(false);
		}
	};

	const handleVideoUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files) {
			return;
		}

		setIsUploading(true);
		try {
			const newVideos = await processVideoFiles(Array.from(files));
			const current = form.getValues("videos") || [];
			form.setValue("videos", [...current, ...newVideos], {
				shouldValidate: true,
			});
		} catch (_error) {
			// Handle error
		} finally {
			setIsUploading(false);
		}
	};

	return {
		isUploading,
		handleImageUpload,
		removeImage: createRemoveImage(form),
		handleVideoUpload,
		removeVideo: createRemoveVideo(form),
	};
}
