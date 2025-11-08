"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Ruler, Sparkles, TreePine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateAIContent } from "@/hooks/use-wizard";
import { cn } from "@/lib/utils/index";

const LandGeneralSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().min(1, "La descripción es requerida"),
	price: z.number().min(1, "El precio es requerido"),
	surface: z.number().min(1, "La superficie es requerida"),
	landType: z.enum(["residential", "commercial", "agricultural", "beachfront"]),
});

type LandGeneralData = z.infer<typeof LandGeneralSchema>;

const LAND_TYPES = [
	{ value: "residential", label: "Residencial" },
	{ value: "commercial", label: "Comercial" },
	{ value: "agricultural", label: "Agrícola" },
	{ value: "beachfront", label: "Frente al Mar" },
];

const LAND_CHARACTERISTICS = [
	"Acceso a agua",
	"Electricidad",
	"Acceso por carretera",
	"Terreno plano",
	"Vista a montañas",
	"Vista al mar",
	"Acceso a río",
	"Área boscosa",
];

type LandData = {
	name?: string;
	description?: string;
	price?: number;
	surface?: number;
	landType?: "residential" | "commercial" | "agricultural" | "beachfront";
	characteristics?: string[];
};

type LandGeneralStepProps = {
	data: LandData;
	onChange: (data: LandData) => void;
	errors?: Record<string, string>;
};

export function LandGeneralStep({
	data,
	onChange,
	errors,
}: LandGeneralStepProps) {
	const [selectedCharacteristics, setSelectedCharacteristics] = useState<
		string[]
	>(data.characteristics || []);

	const generateAI = useGenerateAIContent();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors: formErrors, isValid },
	} = useForm<LandGeneralData>({
		resolver: zodResolver(LandGeneralSchema),
		mode: "onChange",
		defaultValues: {
			name: data.name || "",
			description: data.description || "",
			price: data.price || undefined,
			surface: data.surface || undefined,
			landType: data.landType || undefined,
		},
	});

	const watchedValues = watch();

	const handleGenerateTitle = useCallback(async () => {
		if (!watchedValues.landType) {
			return;
		}

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "land",
				contentType: "title",
				baseData: {
					landType: watchedValues.landType,
					price: watchedValues.price,
					surface: watchedValues.surface,
				},
			});

			if (result.success && result.data?.content?.title) {
				setValue("name", result.data.content.title);
			}
		} catch (_error) {}
	}, [watchedValues, generateAI, setValue]);

	const handleGenerateDescription = useCallback(async () => {
		if (!watchedValues.landType) {
			return;
		}

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "land",
				contentType: "description",
				baseData: {
					landType: watchedValues.landType,
					price: watchedValues.price,
					surface: watchedValues.surface,
					characteristics: selectedCharacteristics,
				},
			});

			if (result.success && result.data?.content?.description) {
				setValue("description", result.data.content.description);
			}
		} catch (_error) {}
	}, [watchedValues, selectedCharacteristics, generateAI, setValue]);

	const handleCharacteristicToggle = (characteristic: string) => {
		const newCharacteristics = selectedCharacteristics.includes(characteristic)
			? selectedCharacteristics.filter((c) => c !== characteristic)
			: [...selectedCharacteristics, characteristic];

		setSelectedCharacteristics(newCharacteristics);
		onChange({ ...watchedValues, characteristics: newCharacteristics });
	};

	// Update parent when form data changes
	useEffect(() => {
		onChange({ ...watchedValues, characteristics: selectedCharacteristics });
	}, [watchedValues, selectedCharacteristics, onChange]);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TreePine className="h-5 w-5" />
						Información General del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Name */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="name">Nombre del Terreno *</Label>
							<Button
								disabled={!watchedValues.landType || generateAI.isPending}
								onClick={handleGenerateTitle}
								size="sm"
								type="button"
								variant="outline"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								{generateAI.isPending ? "Generando..." : "Generar con IA"}
							</Button>
						</div>
						<Input
							id="name"
							{...register("name")}
							className={cn(formErrors.name && "border-destructive")}
							placeholder="Ej: Terreno en Punta Cana"
						/>
						{formErrors.name && (
							<p className="text-destructive text-sm">
								{formErrors.name.message}
							</p>
						)}
					</div>

					{/* Land Type */}
					<div className="space-y-2">
						<Label>Tipo de Terreno *</Label>
						<Select
							onValueChange={(value) =>
								setValue(
									"landType",
									value as
										| "residential"
										| "commercial"
										| "agricultural"
										| "beachfront"
								)
							}
							value={watchedValues.landType || ""}
						>
							<SelectTrigger
								className={cn(formErrors.landType && "border-destructive")}
							>
								<SelectValue placeholder="Selecciona el tipo" />
							</SelectTrigger>
							<SelectContent>
								{LAND_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{formErrors.landType && (
							<p className="text-destructive text-sm">
								{formErrors.landType.message}
							</p>
						)}
					</div>

					{/* Price and Surface */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="price">Precio (USD) *</Label>
							<div className="relative">
								<DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="price"
									type="number"
									{...register("price", { valueAsNumber: true })}
									className={cn(
										"pl-10",
										formErrors.price && "border-destructive"
									)}
									min="0"
									placeholder="0"
								/>
							</div>
							{formErrors.price && (
								<p className="text-destructive text-sm">
									{formErrors.price.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="surface">Superficie (m²) *</Label>
							<div className="relative">
								<Ruler className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="surface"
									type="number"
									{...register("surface", { valueAsNumber: true })}
									className={cn(
										"pl-10",
										formErrors.surface && "border-destructive"
									)}
									min="0"
									placeholder="0"
								/>
							</div>
							{formErrors.surface && (
								<p className="text-destructive text-sm">
									{formErrors.surface.message}
								</p>
							)}
						</div>
					</div>

					{/* Characteristics */}
					<div className="space-y-2">
						<Label>Características del Terreno</Label>
						<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
							{LAND_CHARACTERISTICS.map((characteristic) => {
								const isSelected =
									selectedCharacteristics.includes(characteristic);
								return (
									<Button
										key={characteristic}
										onClick={() => handleCharacteristicToggle(characteristic)}
										size="sm"
										type="button"
										variant={isSelected ? "default" : "outline"}
									>
										{characteristic}
									</Button>
								);
							})}
						</div>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="description">Descripción *</Label>
							<Button
								disabled={!watchedValues.landType || generateAI.isPending}
								onClick={handleGenerateDescription}
								size="sm"
								type="button"
								variant="outline"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								{generateAI.isPending ? "Generando..." : "Generar con IA"}
							</Button>
						</div>
						<Textarea
							id="description"
							{...register("description")}
							className={cn(formErrors.description && "border-destructive")}
							placeholder="Describe las características principales del terreno..."
							rows={4}
						/>
						{formErrors.description && (
							<p className="text-destructive text-sm">
								{formErrors.description.message}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
