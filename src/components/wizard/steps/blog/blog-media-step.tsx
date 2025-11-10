"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadStep, type ImageMetadata } from "@/components/wizard/shared/image-upload-step";
import type { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";

type BlogMediaStepProps = {
	data: BlogWizardData;
	onChange: (data: BlogWizardData) => void;
};

export function BlogMediaStep({ data, onChange }: BlogMediaStepProps) {
	const handleImagesChange = (images: ImageMetadata[]) => {
		// For blog, we only need the first image as coverImage
		const coverImage = images.length > 0 ? images[0].url : undefined;
		onChange({ ...data, coverImage });
	};

	// Convert coverImage string back to ImageMetadata for the component
	const imageMetadata: ImageMetadata[] = data.coverImage ? [{
		id: "cover-image",
		url: data.coverImage,
		filename: data.coverImage.split('/').pop() || "cover-image",
		size: 0,
		contentType: 'image/jpeg',
		displayOrder: 0,
	}] : [];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ImageIcon className="h-5 w-5" />
						Imagen de Portada
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ImageUploadStep
						images={imageMetadata}
						onImagesChange={handleImagesChange}
						title="Imagen de Portada"
						description="Sube una imagen para la portada del artículo"
						maxImages={1}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
