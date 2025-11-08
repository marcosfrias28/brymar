"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BlogMediaData = {
	coverImage?: File;
	imageUrl?: string;
};

type BlogMediaStepProps = {
	data: BlogMediaData;
	onChange: (data: BlogMediaData) => void;
	errors?: Record<string, string>;
};

export function BlogMediaStep({ data, onChange, errors }: BlogMediaStepProps) {
	const handleChange = (field: keyof BlogMediaData, value: File | string) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ImageIcon className="h-5 w-5" />
						Imagen de Portada
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="coverImage">Imagen de Portada</Label>
						<Input
							accept="image/*"
							id="coverImage"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									handleChange("coverImage", file);
								}
							}}
							type="file"
						/>
						<p className="text-muted-foreground text-sm">
							Selecciona una imagen de portada para el artículo
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="imageUrl">URL de Imagen (alternativa)</Label>
						<Input
							id="imageUrl"
							onChange={(e) => handleChange("imageUrl", e.target.value)}
							placeholder="https://ejemplo.com/imagen.jpg"
							value={data.imageUrl || ""}
						/>
						<p className="text-muted-foreground text-sm">
							O proporciona una URL de imagen externa
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
