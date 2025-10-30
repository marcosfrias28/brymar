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

export type FormField = {
	name: string;
	label: string;
	type: "text" | "number" | "textarea" | "select" | "file" | "rich-text";
	required?: boolean;
	placeholder?: string;
	options?: { value: string; label: string }[];
	accept?: string;
	rows?: number;
};

export type FormConfig = {
	title: string;
	description?: string;
	fields: FormField[];
	submitText: string;
	cancelText?: string;
	showDraftOption?: boolean;
	showImageUpload?: boolean;
	maxImages?: number;
};

type UnifiedFormProps = {
	config: FormConfig;
	initialData?: Record<string, any>;
	isEditing?: boolean;
	onSubmit: (
		data: FormData,
		action?: "draft" | "publish"
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onCancel?: () => void;
};

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
		null
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
		action?: "draft" | "publish"
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
						`${config.title} ${actionText} ${statusText} exitosamente`
				);

				if (onCancel) {
					onCancel();
				} else {
					router.back();
				}
			} else {
				toast.error(
					result.error || `Error al guardar ${config.title.toLowerCase()}`
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
						className={cn("mt-1", secondaryColorClasses.inputFocus)}
						id={field.name}
						onChange={(e) => handleInputChange(field.name, e.target.value)}
						placeholder={field.placeholder}
						required={field.required}
						type={field.type}
						value={value}
					/>
				);

			case "textarea":
				return (
					<Textarea
						className={cn("mt-1", secondaryColorClasses.inputFocus)}
						id={field.name}
						onChange={(e) => handleInputChange(field.name, e.target.value)}
						placeholder={field.placeholder}
						required={field.required}
						rows={field.rows || 3}
						value={value}
					/>
				);

			case "select":
				return (
					<Select
						onValueChange={(val) => handleInputChange(field.name, val)}
						value={value}
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
								accept={field.accept}
								className={secondaryColorClasses.inputFocus}
								id={field.name}
								onChange={handleImageChange}
								type="file"
							/>
							<Upload className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 transform text-muted-foreground" />
						</div>
						{coverImagePreview && (
							<div
								className={cn(
									"relative h-32 w-full overflow-hidden rounded-lg border",
									secondaryColorClasses.accent
								)}
							>
								<Image
									alt="Vista previa"
									className="object-cover"
									fill
									src={coverImagePreview}
								/>
							</div>
						)}
					</div>
				);

			case "rich-text":
				return (
					<RichTextEditor
						className="min-h-[200px]"
						content={value}
						onChange={(content) => handleInputChange(field.name, content)}
						placeholder={field.placeholder}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="mx-auto max-w-5xl">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-3">
					<Card
						className={cn(
							"border-border shadow-lg",
							secondaryColorClasses.cardHover
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
										className="font-medium text-foreground text-sm"
										htmlFor={field.name}
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
								secondaryColorClasses.cardHover
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
									maxImages={config.maxImages || 10}
									onImagesChange={setImages}
								/>
							</CardContent>
						</Card>
					)}

					<Card
						className={cn(
							"border-border shadow-lg",
							secondaryColorClasses.cardHover
						)}
					>
						<CardHeader className="pb-4">
							<CardTitle className="text-foreground text-lg">
								Acciones
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								className={cn(
									"w-full bg-primary text-primary-foreground hover:bg-primary/90",
									secondaryColorClasses.focusRing
								)}
								disabled={isLoading}
								onClick={(e) => handleSubmit(e, "publish")}
								type="button"
							>
								<Eye className="mr-2 h-4 w-4" />
								{isLoading ? "Guardando..." : config.submitText}
							</Button>

							{config.showDraftOption && (
								<Button
									className={cn(
										"w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white",
										secondaryColorClasses.focusRing
									)}
									disabled={isLoading}
									onClick={(e) => handleSubmit(e, "draft")}
									type="button"
									variant="outline"
								>
									<FileText className="mr-2 h-4 w-4" />
									{isLoading ? "Guardando..." : "Guardar Borrador"}
								</Button>
							)}

							<Button
								className={cn(
									"w-full border-border text-foreground hover:bg-muted",
									secondaryColorClasses.focusRing
								)}
								onClick={onCancel || (() => router.back())}
								type="button"
								variant="outline"
							>
								<X className="mr-2 h-4 w-4" />
								{config.cancelText || "Cancelar"}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
