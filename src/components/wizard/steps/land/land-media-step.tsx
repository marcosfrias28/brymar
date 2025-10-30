"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LandMediaData = {
	images?: File[];
};

type LandMediaStepProps = {
	data: LandMediaData;
	onChange: (data: LandMediaData) => void;
	errors?: Record<string, string>;
};

export function LandMediaStep({ data, onChange, errors }: LandMediaStepProps) {
	const handleChange = (field: keyof LandMediaData, value: File[]) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ImageIcon className="h-5 w-5" />
						Imágenes del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="images">Imágenes</Label>
						<Input
							accept="image/*"
							id="images"
							multiple
							onChange={(e) => {
								const files = Array.from(e.target.files || []);
								handleChange("images", files);
							}}
							type="file"
						/>
						<p className="text-muted-foreground text-sm">
							Selecciona múltiples imágenes del terreno
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
