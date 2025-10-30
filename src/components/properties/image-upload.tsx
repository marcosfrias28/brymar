"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ImageUploadProps = {
	images: File[];
	onImagesChange: (images: File[]) => void;
	maxImages?: number;
};

export function ImageUpload({
	images,
	onImagesChange,
	maxImages = 10,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files) {
				return;
			}

			const newFiles = Array.from(files).filter((file) => {
				if (!file.type.startsWith("image/")) {
					toast.error(`${file.name} no es una imagen válida`);
					return false;
				}
				if (file.size > 5 * 1024 * 1024) {
					// 5MB limit
					toast.error(`${file.name} es demasiado grande (máx. 5MB)`);
					return false;
				}
				return true;
			});

			const totalImages = images.length + newFiles.length;
			if (totalImages > maxImages) {
				toast.error(`Máximo ${maxImages} imágenes permitidas`);
				return;
			}

			onImagesChange([...images, ...newFiles]);
		},
		[images, onImagesChange, maxImages]
	);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles]
	);

	const removeImage = (index: number) => {
		const newImages = images.filter((_, i) => i !== index);
		onImagesChange(newImages);
	};

	return (
		<div className="space-y-4">
			{/* Upload Area */}
			<div
				className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
					dragActive
						? "border-primary bg-primary/5"
						: "border-border hover:border-primary"
				}`}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<div className="flex flex-col items-center gap-4">
					<div className="rounded-full bg-primary/10 p-4">
						<Upload className="h-8 w-8 text-primary" />
					</div>
					<div>
						<p className="font-medium text-foreground text-lg">
							Arrastra las imágenes aquí o haz clic para seleccionar
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Máximo {maxImages} imágenes, hasta 5MB cada una
						</p>
					</div>
					<Button
						className="border-border bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground"
						onClick={() => {
							const input = document.createElement("input");
							input.type = "file";
							input.multiple = true;
							input.accept = "image/*";
							input.onchange = (e) => {
								const target = e.target as HTMLInputElement;
								handleFiles(target.files);
							};
							input.click();
						}}
						type="button"
						variant="outline"
					>
						<ImageIcon className="mr-2 h-4 w-4" />
						Seleccionar Imágenes
					</Button>
				</div>
			</div>

			{/* Image Preview Grid */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 laptop:grid-cols-5 tablet:grid-cols-4 gap-4 smartphone:grid-cols-3">
					{images.map((file, index) => (
						<Card className="group relative border-blackCoral" key={index}>
							<div className="relative aspect-square overflow-hidden rounded-lg">
								<Image
									alt={`Preview ${index + 1}`}
									className="object-cover"
									fill
									src={URL.createObjectURL(file) || "/placeholder.svg"}
								/>
								<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										className="bg-red-600 hover:bg-red-700"
										onClick={() => removeImage(index)}
										size="sm"
										type="button"
										variant="destructive"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="p-2">
								<p className="truncate text-blackCoral text-xs">{file.name}</p>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Images Counter */}
			<div className="text-blackCoral text-sm">
				{images.length} de {maxImages} imágenes seleccionadas
			</div>
		</div>
	);
}
