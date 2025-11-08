/**
 * Modern Wizard Form Field Component with AI Integration
 * Provides consistent form field styling and AI generation capabilities
 */

"use client";

import { motion } from "framer-motion";
import {
	Building,
	Calendar,
	DollarSign,
	Eye,
	EyeOff,
	FileText,
	Hash,
	Home,
	type LucideIcon,
	Mail,
	MapPin,
	Phone,
	Ruler,
	Tag,
	TreePine,
	User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	type AIContentData,
	useEnhancedAIGeneration,
} from "@/hooks/use-enhanced-ai-generation";
import { cn } from "@/lib/utils/index";
import { ModernAIButton } from "./modern-step-layout";

// Icon mapping for different field types
const fieldIcons: Record<string, LucideIcon> = {
	price: DollarSign,
	surface: Ruler,
	location: MapPin,
	address: MapPin,
	title: Home,
	name: Tag,
	description: FileText,
	content: FileText,
	tags: Hash,
	date: Calendar,
	email: Mail,
	phone: Phone,
	user: User,
	property: Building,
	land: TreePine,
};

type ModernWizardFormFieldProps = {
	label: string;
	description?: string;
	type?: "text" | "email" | "password" | "number" | "textarea" | "tel";
	placeholder?: string;
	required?: boolean;
	error?: string;
	icon?: LucideIcon | string;
	register?: UseFormRegisterReturn;
	value?: string | number;
	onChange?: (value: string | number) => void;
	className?: string;

	// AI Generation props
	aiEnabled?: boolean;
	aiType?: "title" | "description" | "tags" | "content";
	aiData?: AIContentData;
	onAIGenerated?: (content: string) => void;

	// Additional props
	suffix?: string;
	prefix?: string;
	maxLength?: number;
	rows?: number;
	disabled?: boolean;
};

export function ModernWizardFormField({
	label,
	description,
	type = "text",
	placeholder,
	required = false,
	error,
	icon,
	register,
	value,
	onChange,
	className,
	aiEnabled = false,
	aiType,
	aiData,
	onAIGenerated,
	suffix,
	prefix,
	maxLength,
	rows = 4,
	disabled = false,
}: ModernWizardFormFieldProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const { generateTitle, generateDescription, generateTags, isGenerating } =
		useEnhancedAIGeneration({
			onSuccess: (_generationType, content) => {
				if (onAIGenerated && typeof content === "string") {
					onAIGenerated(content);
				}
			},
		});

	// Determine icon
	const IconComponent =
		typeof icon === "string"
			? fieldIcons[icon] || Tag
			: icon || fieldIcons[type] || Tag;

	// Handle AI generation
	const handleAIGeneration = async () => {
		if (!(aiData && aiType)) {
			return;
		}

		try {
			let result: string | null = null;

			switch (aiType) {
				case "title":
					result = await generateTitle(aiData);
					break;
				case "description":
				case "content": {
					const desc = await generateDescription(aiData);
					result = typeof desc === "string" ? desc : desc?.plainText || null;
					break;
				}
				case "tags": {
					const tags = await generateTags(aiData);
					result = tags?.join(", ") || null;
					break;
				}
			}

			if (result && onAIGenerated) {
				onAIGenerated(result);
			}
		} catch (_error) {}
	};

	// Input props
	const inputProps = {
		placeholder,
		disabled: disabled || isGenerating,
		maxLength,
		className: cn(
			"pl-10 transition-all duration-200",
			suffix && "pr-16",
			error && "border-red-500 focus:border-red-500",
			isFocused && !error && "border-primary",
			className
		),
		onFocus: () => setIsFocused(true),
		onBlur: () => setIsFocused(false),
		...register,
	};

	// Handle controlled vs uncontrolled
	const controlledProps =
		value !== undefined && onChange
			? {
					value,
					onChange: (
						e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
					) => {
						const newValue =
							type === "number" ? Number(e.target.value) : e.target.value;
						onChange(newValue);
					},
				}
			: {};

	const finalInputProps = { ...inputProps, ...controlledProps };

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="space-y-2"
			initial={{ opacity: 0, y: 10 }}
		>
			{/* Label */}
			<div className="flex items-center justify-between">
				<Label className="flex items-center gap-2 font-medium text-sm">
					{label}
					{required && <span className="text-red-500">*</span>}
				</Label>

				{/* AI Generation Button */}
				{aiEnabled && aiData && (
					<ModernAIButton
						className="h-6 px-2 text-xs"
						isGenerating={isGenerating}
						label={`Generar ${aiType}`}
						onGenerate={handleAIGeneration}
						size="sm"
						variant="ghost"
					/>
				)}
			</div>

			{/* Description */}
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}

			{/* Input Container */}
			<div className="relative">
				{/* Icon */}
				<div className="-translate-y-1/2 absolute top-1/2 left-3 z-10">
					<IconComponent
						className={cn(
							"h-4 w-4 transition-colors duration-200",
							isFocused ? "text-primary" : "text-muted-foreground",
							error && "text-red-500"
						)}
					/>
				</div>

				{/* Prefix */}
				{prefix && (
					<div className="-translate-y-1/2 absolute top-1/2 left-10 z-10">
						<span className="text-muted-foreground text-sm">{prefix}</span>
					</div>
				)}

				{/* Input Field */}
				{type === "textarea" ? (
					<Textarea
						{...finalInputProps}
						className={cn(finalInputProps.className, "resize-none")}
						rows={rows}
					/>
				) : (
					<Input
						{...finalInputProps}
						type={
							type === "password" ? (showPassword ? "text" : "password") : type
						}
					/>
				)}

				{/* Password Toggle */}
				{type === "password" && (
					<Button
						className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 p-0"
						onClick={() => setShowPassword(!showPassword)}
						size="sm"
						type="button"
						variant="ghost"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				)}

				{/* Suffix */}
				{suffix && (
					<div className="-translate-y-1/2 absolute top-1/2 right-3">
						<Badge className="text-xs" variant="secondary">
							{suffix}
						</Badge>
					</div>
				)}
			</div>

			{/* Character Count */}
			{maxLength && type === "textarea" && (
				<div className="flex justify-end">
					<span className="text-muted-foreground text-xs">
						{value?.toString().length || 0} / {maxLength}
					</span>
				</div>
			)}

			{/* Error Message */}
			{error && (
				<motion.p
					animate={{ opacity: 1, height: "auto" }}
					className="flex items-center gap-1 text-red-500 text-sm"
					initial={{ opacity: 0, height: 0 }}
				>
					<span className="h-1 w-1 rounded-full bg-red-500" />
					{error}
				</motion.p>
			)}
		</motion.div>
	);
}

// Specialized form fields for common use cases
export function ModernPriceField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "prefix">
) {
	return (
		<ModernWizardFormField
			{...props}
			icon="price"
			placeholder="150,000"
			prefix="$"
			type="number"
		/>
	);
}

export function ModernSurfaceField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "suffix">
) {
	return (
		<ModernWizardFormField
			{...props}
			icon="surface"
			placeholder="200"
			suffix="m²"
			type="number"
		/>
	);
}

export function ModernTitleField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">
) {
	return (
		<ModernWizardFormField
			{...props}
			aiType="title"
			icon="title"
			maxLength={100}
			placeholder="Hermosa casa con jardín en zona residencial"
			type="text"
		/>
	);
}

export function ModernDescriptionField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">
) {
	return (
		<ModernWizardFormField
			{...props}
			aiType="description"
			icon="description"
			maxLength={2000}
			placeholder="Describe las características principales de la propiedad..."
			rows={6}
			type="textarea"
		/>
	);
}

export function ModernTagsField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">
) {
	return (
		<ModernWizardFormField
			{...props}
			aiType="tags"
			description="Separa las etiquetas con comas"
			icon="tags"
			placeholder="piscina, jardín, garaje, cerca del metro"
			type="text"
		/>
	);
}

export function ModernLocationField(
	props: Omit<ModernWizardFormFieldProps, "type" | "icon">
) {
	return (
		<ModernWizardFormField
			{...props}
			icon="location"
			placeholder="Santo Domingo, Distrito Nacional"
			type="text"
		/>
	);
}
