"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PropertyMediaSchema } from "@/lib/schemas/property-wizard-schemas";
import type { PropertyStepProps, PropertyWizardData } from "./types";
import { MediaFormFields } from "./media-step/media-form-fields";
import { useMediaUpload } from "./media-step/use-media-upload";

export function PropertyMediaStep({ data, onChange }: PropertyStepProps) {
	const form = useForm<PropertyWizardData>({
		resolver: zodResolver(PropertyMediaSchema),
		defaultValues: {
			images: data.images || [],
			videos: data.videos || [],
		},
		mode: "onChange",
	});

	const {
		isUploading,
		handleImageUpload,
		removeImage,
		handleVideoUpload,
		removeVideo,
	} = useMediaUpload(form);

	const images = form.watch("images") || [];
	const videos = form.watch("videos") || [];

	useEffect(() => {
		const subscription = form.watch((formData) => {
			onChange({ ...data, ...formData } as PropertyWizardData);
		});
		return () => subscription.unsubscribe();
	}, [form, onChange, data]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Fotos y videos</CardTitle>
				<CardDescription>
					Añade imágenes y videos para mostrar tu propiedad
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6">
						<MediaFormFields
							control={form.control}
							images={images}
							isUploading={isUploading}
							onImageUpload={handleImageUpload}
							onRemoveImage={removeImage}
							onRemoveVideo={removeVideo}
							onVideoUpload={handleVideoUpload}
							videos={videos}
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
