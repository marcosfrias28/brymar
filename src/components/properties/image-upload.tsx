"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
	images: File[];
	onImagesChange: (images: File[]) => void;
	maxImages?: number;
}

export function ImageUpload({
	images,
	onImagesChange,
	maxImages = 10,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files) return;

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
		[images, onImagesChange, maxImages],
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
		[handleFiles],
	);

	const removeImage = (index: number) => {
		const newImages = images.filter((_, i) => i !== index);
		onImagesChange(newImages);
	};

	return (
		<div className="space-y-4">
			{/* Upload Area */}
			<div
				className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
					<div className="p-4 rounded-full bg-primary/10">
						<Upload className="h-8 w-8 text-primary" />
					</div>
					<div>
						<p className="text-lg font-medium text-foreground">
							Arrastra las imágenes aquí o haz clic para seleccionar
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Máximo {maxImages} imágenes, hasta 5MB cada una
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						className="border-border text-foreground hover:bg-primary hover:text-primary-foreground bg-transparent"
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
					>
						<ImageIcon className="h-4 w-4 mr-2" />
						Seleccionar Imágenes
					</Button>
				</div>
			</div>

			{/* Image Preview Grid */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 smartphone:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-5 gap-4">
					{images.map((file, index) => (
						<Card key={index} className="relative group border-blackCoral">
							<div className="aspect-square relative overflow-hidden rounded-lg">
								<Image
									src={URL.createObjectURL(file) || "/placeholder.svg"}
									alt={`Preview ${index + 1}`}
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Button
										type="button"
										size="sm"
										variant="destructive"
										onClick={() => removeImage(index)}
										className="bg-red-600 hover:bg-red-700"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="p-2">
								<p className="text-xs text-blackCoral truncate">{file.name}</p>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Images Counter */}
			<div className="text-sm text-blackCoral">
				{images.length} de {maxImages} imágenes seleccionadas
			</div>
		</div>
	);
}
