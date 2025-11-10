"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ImageUploadStep,
	type ImageMetadata,
} from "@/components/wizard/shared/image-upload-step";
import type { LandWizardData } from "../../land-wizard";

type LandMediaStepProps = {
	data: LandWizardData;
	onChange: (data: LandWizardData) => void;
};

export function LandMediaStep({ data, onChange }: LandMediaStepProps) {
	const handleImagesChange = (images: ImageMetadata[]) => {
		// Convert ImageMetadata array to string URLs for LandWizardData
		const imageUrls = images.map((img) => img.url);
		onChange({ ...data, images: imageUrls });
	};

	// Convert string URLs back to ImageMetadata for the component
	const imageMetadata: ImageMetadata[] = (data.images || []).map(
		(url, index) => ({
			id: `image-${index}`,
			url,
			filename: url.split("/").pop() || `image-${index}`,
			size: 0, // Unknown size
			contentType: "image/jpeg", // Default content type
			displayOrder: index,
		})
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ImageIcon className="h-5 w-5" />
						Imágenes del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ImageUploadStep
						description="Sube las imágenes del terreno para mostrar en el listado"
						images={imageMetadata}
						maxImages={10}
						onImagesChange={handleImagesChange}
						title="Imágenes del Terreno"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
