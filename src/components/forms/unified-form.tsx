"use client";

import { Eye, FileText, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/properties/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export interface FormField {
	name: string;
	label: string;
	type: "text" | "number" | "textarea" | "select" | "file" | "rich-text";
	required?: boolean;
	placeholder?: string;
	options?: { value: string; label: string }[];
	accept?: string;
	rows?: number;
}

export interface FormConfig {
	title: string;
	description?: string;
	fields: FormField[];
	submitText: string;
	cancelText?: string;
	showDraftOption?: boolean;
	showImageUpload?: boolean;
	maxImages?: number;
}

interface UnifiedFormProps {
	config: FormConfig;
	initialData?: Record<string, any>;
	isEditing?: boolean;
	onSubmit: (
		data: FormData,
		action?: "draft" | "publish",
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onCancel?: () => void;
}

export function UnifiedForm({
	config,
	initialData = {},
	isEditing = false,
	onSubmit,
	onCancel,
}: UnifiedFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState<Record<string, any>>(initialData);
	const [images, setImages] = useState<File[]>(initialData.images || []);
	const [isLoading, setIsLoading] = useState(false);
	const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
		null,
	);

	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("La imagen es demasiado grande (máx. 5MB)");
				return;
			}

			handleInputChange("coverImage", file);

			const reader = new FileReader();
			reader.onload = (e) => {
				setCoverImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (
		e: React.FormEvent,
		action?: "draft" | "publish",
	) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Validate required fields
			const missingFields = config.fields
				.filter((field) => field.required && !formData[field.name])
				.map((field) => field.label);

			if (missingFields.length > 0) {
				toast.error(`Por favor completa: ${missingFields.join(", ")}`);
				return;
			}

			// Create FormData
			const serverFormData = new FormData();

			// Add all form fields
			config.fields.forEach((field) => {
				const value = formData[field.name];
				if (value !== undefined && value !== null) {
					if (field.type === "file" && value instanceof File) {
						serverFormData.append(field.name, value);
					} else if (Array.isArray(value)) {
						serverFormData.append(field.name, JSON.stringify(value));
					} else {
						serverFormData.append(field.name, value.toString());
					}
				}
			});

			// Add images if enabled
			if (config.showImageUpload) {
				images.forEach((image, index) => {
					serverFormData.append(`image_${index}`, image);
				});
			}

			const result = await onSubmit(serverFormData, action);

			if (result.success) {
				const actionText = isEditing ? "actualizado" : "creado";
				const statusText =
					action === "publish"
						? "y publicado"
						: action === "draft"
							? "como borrador"
							: "";
				toast.success(
					result.message ||
						`${config.title} ${actionText} ${statusText} exitosamente`,
				);

				if (onCancel) {
					onCancel();
				} else {
					router.back();
				}
			} else {
				toast.error(
					result.error || `Error al guardar ${config.title.toLowerCase()}`,
				);
			}
		} catch (_error) {
			toast.error(`Error al guardar ${config.title.toLowerCase()}`);
		} finally {
			setIsLoading(false);
		}
	};

	const renderField = (field: FormField) => {
		const value = formData[field.name] || "";

		switch (field.type) {
			case "text":
			case "number":
				return (
					<Input
						id={field.name}
						type={field.type}
						value={value}
						onChange={(e) => handleInputChange(field.name, e.target.value)}
						placeholder={field.placeholder}
						className={cn("mt-1", secondaryColorClasses.inputFocus)}
						required={field.required}
					/>
				);

			case "textarea":
				return (
					<Textarea
						id={field.name}
						value={value}
						onChange={(e) => handleInputChange(field.name, e.target.value)}
						placeholder={field.placeholder}
						rows={field.rows || 3}
						className={cn("mt-1", secondaryColorClasses.inputFocus)}
						required={field.required}
					/>
				);

			case "select":
				return (
					<Select
						value={value}
						onValueChange={(val) => handleInputChange(field.name, val)}
					>
						<SelectTrigger
							className={cn("mt-1", secondaryColorClasses.selectFocus)}
						>
							<SelectValue placeholder={field.placeholder} />
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case "file":
				return (
					<div className="space-y-2">
						<div className="relative">
							<Input
								id={field.name}
								type="file"
								accept={field.accept}
								onChange={handleImageChange}
								className={secondaryColorClasses.inputFocus}
							/>
							<Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						</div>
						{coverImagePreview && (
							<div
								className={cn(
									"relative w-full h-32 rounded-lg overflow-hidden border",
									secondaryColorClasses.accent,
								)}
							>
								<Image
									src={coverImagePreview}
									alt="Vista previa"
									fill
									className="object-cover"
								/>
							</div>
						)}
					</div>
				);

			case "rich-text":
				return (
					<RichTextEditor
						content={value}
						onChange={(content) => handleInputChange(field.name, content)}
						placeholder={field.placeholder}
						className="min-h-[200px]"
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="max-w-5xl mx-auto">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-3 space-y-6">
					<Card
						className={cn(
							"border-border shadow-lg",
							secondaryColorClasses.cardHover,
						)}
					>
						<CardHeader className="pb-4">
							<CardTitle className="text-foreground text-lg">
								{config.title}
							</CardTitle>
							{config.description && (
								<p className="text-muted-foreground text-sm">
									{config.description}
								</p>
							)}
						</CardHeader>
						<CardContent className="space-y-4">
							{config.fields.map((field) => (
								<div key={field.name}>
									<Label
										htmlFor={field.name}
										className="text-foreground text-sm font-medium"
									>
										{field.label} {field.required && "*"}
									</Label>
									{renderField(field)}
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{config.showImageUpload && (
						<Card
							className={cn(
								"border-border shadow-lg",
								secondaryColorClasses.cardHover,
							)}
						>
							<CardHeader className="pb-4">
								<CardTitle className="text-foreground text-lg">
									Imágenes
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ImageUpload
									images={images}
									onImagesChange={setImages}
									maxImages={config.maxImages || 10}
								/>
							</CardContent>
						</Card>
					)}

					<Card
						className={cn(
							"border-border shadow-lg",
							secondaryColorClasses.cardHover,
						)}
					>
						<CardHeader className="pb-4">
							<CardTitle className="text-foreground text-lg">
								Acciones
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								type="button"
								onClick={(e) => handleSubmit(e, "publish")}
								disabled={isLoading}
								className={cn(
									"w-full bg-primary hover:bg-primary/90 text-primary-foreground",
									secondaryColorClasses.focusRing,
								)}
							>
								<Eye className="h-4 w-4 mr-2" />
								{isLoading ? "Guardando..." : config.submitText}
							</Button>

							{config.showDraftOption && (
								<Button
									type="button"
									variant="outline"
									onClick={(e) => handleSubmit(e, "draft")}
									disabled={isLoading}
									className={cn(
										"w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white",
										secondaryColorClasses.focusRing,
									)}
								>
									<FileText className="h-4 w-4 mr-2" />
									{isLoading ? "Guardando..." : "Guardar Borrador"}
								</Button>
							)}

							<Button
								type="button"
								variant="outline"
								onClick={onCancel || (() => router.back())}
								className={cn(
									"w-full border-border text-foreground hover:bg-muted",
									secondaryColorClasses.focusRing,
								)}
							>
								<X className="h-4 w-4 mr-2" />
								{config.cancelText || "Cancelar"}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
