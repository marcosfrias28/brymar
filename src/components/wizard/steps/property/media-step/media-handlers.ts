import type { UseFormReturn } from "react-hook-form";
import type { PropertyWizardData } from "../types";

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

export function createRemoveImage(form: UseFormReturn<PropertyWizardData>) {
	return (imageToRemove: ImageFile) => {
		const current = form.getValues("images") || [];
		form.setValue(
			"images",
			current.filter((image) => image.url !== imageToRemove.url),
			{ shouldValidate: true }
		);
	};
}

export function createRemoveVideo(form: UseFormReturn<PropertyWizardData>) {
	return (videoToRemove: Video) => {
		const current = form.getValues("videos") || [];
		form.setValue(
			"videos",
			current.filter((video) => video.url !== videoToRemove.url),
			{ shouldValidate: true }
		);
	};
}
