"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Building,
	Castle,
	Home,
	Sparkles,
	Store,
	TreePine,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateAIContent } from "@/hooks/use-wizard";
import { cn } from "@/lib/utils";

const PropertyGeneralSchema = z.object({
	title: z.string().min(1, "El título es requerido"),
	description: z.string().optional(),
	price: z.number().min(1, "El precio es requerido"),
	surface: z.number().min(1, "La superficie es requerida"),
	propertyType: z.enum(["house", "apartment", "villa", "land", "commercial"]),
	bedrooms: z.number().optional(),
	bathrooms: z.number().optional(),
});

type PropertyGeneralData = z.infer<typeof PropertyGeneralSchema>;

const PROPERTY_TYPES = [
	{
		value: "house",
		label: "Casa",
		icon: Home,
		description: "Casa unifamiliar independiente",
	},
	{
		value: "apartment",
		label: "Apartamento",
		icon: Building,
		description: "Apartamento en edificio residencial",
	},
	{
		value: "villa",
		label: "Villa",
		icon: Castle,
		description: "Villa de lujo con jardín",
	},
	{
		value: "land",
		label: "Terreno",
		icon: TreePine,
		description: "Terreno para construcción",
	},
	{
		value: "commercial",
		label: "Comercial",
		icon: Store,
		description: "Propiedad comercial o de oficinas",
	},
];

const CHARACTERISTICS = [
	"Piscina",
	"Gimnasio",
	"Estacionamiento",
	"Jardín",
	"Terraza",
	"Balcón",
	"Garaje",
	"Seguridad",
	"Amueblado",
	"Aire Acondicionado",
	"Calefacción",
	"Chimenea",
];

interface PropertyData {
	title?: string;
	description?: string;
	price?: number;
	surface?: number;
	propertyType?: "house" | "apartment" | "villa" | "land" | "commercial";
	bedrooms?: number;
	bathrooms?: number;
	characteristics?: string[];
}

interface PropertyGeneralStepProps {
	data: PropertyData;
	onChange: (data: PropertyData) => void;
	errors?: Record<string, string>;
}

export function PropertyGeneralStep({
	data,
	onChange,
	errors,
}: PropertyGeneralStepProps) {
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
	} = useForm<PropertyGeneralData>({
		resolver: zodResolver(PropertyGeneralSchema),
		mode: "onChange",
		defaultValues: {
			title: data.title || "",
			description: data.description || "",
			price: data.price || undefined,
			surface: data.surface || undefined,
			propertyType: data.propertyType || undefined,
			bedrooms: data.bedrooms || undefined,
			bathrooms: data.bathrooms || undefined,
		},
	});

	const watchedValues = watch();

	const handleGenerateTitle = useCallback(async () => {
		if (!watchedValues.propertyType) return;

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "property",
				contentType: "title",
				baseData: {
					propertyType: watchedValues.propertyType,
					price: watchedValues.price,
					surface: watchedValues.surface,
				},
			});

			if (result.success && result.data?.content?.title) {
				setValue("title", result.data.content.title);
			}
		} catch (error) {
			console.error("Error generating title:", error);
		}
	}, [watchedValues, generateAI, setValue]);

	const handleGenerateDescription = useCallback(async () => {
		if (!watchedValues.propertyType) return;

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "property",
				contentType: "description",
				baseData: {
					propertyType: watchedValues.propertyType,
					price: watchedValues.price,
					surface: watchedValues.surface,
					bedrooms: watchedValues.bedrooms,
					bathrooms: watchedValues.bathrooms,
					characteristics: selectedCharacteristics,
				},
			});

			if (result.success && result.data?.content?.description) {
				setValue("description", result.data.content.description);
			}
		} catch (error) {
			console.error("Error generating description:", error);
		}
	}, [watchedValues, selectedCharacteristics, generateAI, setValue]);

	const handleCharacteristicToggle = (characteristic: string) => {
		const newCharacteristics = selectedCharacteristics.includes(characteristic)
			? selectedCharacteristics.filter((c) => c !== characteristic)
			: [...selectedCharacteristics, characteristic];

		setSelectedCharacteristics(newCharacteristics);
		onChange({ ...watchedValues, characteristics: newCharacteristics });
	};

	// Update parent when form data changes
	React.useEffect(() => {
		onChange({ ...watchedValues, characteristics: selectedCharacteristics });
	}, [watchedValues, selectedCharacteristics, onChange]);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Home className="h-5 w-5" />
						Información General
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Property Type Selection */}
					<div className="space-y-2">
						<Label>Tipo de Propiedad *</Label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{PROPERTY_TYPES.map((type) => {
								const Icon = type.icon;
								const isSelected = watchedValues.propertyType === type.value;

								return (
									<Button
										key={type.value}
										type="button"
										variant={isSelected ? "default" : "outline"}
										className="h-auto p-4 flex flex-col items-center gap-2"
										onClick={() =>
											setValue(
												"propertyType",
												type.value as
													| "house"
													| "apartment"
													| "villa"
													| "land"
													| "commercial",
											)
										}
									>
										<Icon className="h-6 w-6" />
										<div className="text-center">
											<div className="font-medium">{type.label}</div>
											<div className="text-xs opacity-70">
												{type.description}
											</div>
										</div>
									</Button>
								);
							})}
						</div>
						{formErrors.propertyType && (
							<p className="text-sm text-destructive">
								{formErrors.propertyType.message}
							</p>
						)}
					</div>

					{/* Title */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="title">Título *</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleGenerateTitle}
								disabled={!watchedValues.propertyType || generateAI.isPending}
							>
								<Sparkles className="h-4 w-4 mr-2" />
								{generateAI.isPending ? "Generando..." : "Generar con IA"}
							</Button>
						</div>
						<Input
							id="title"
							{...register("title")}
							placeholder="Ej: Hermosa casa con jardín en zona residencial"
							className={cn(formErrors.title && "border-destructive")}
						/>
						{formErrors.title && (
							<p className="text-sm text-destructive">
								{formErrors.title.message}
							</p>
						)}
					</div>

					{/* Price and Surface */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="price">Precio (USD) *</Label>
							<Input
								id="price"
								type="number"
								{...register("price", { valueAsNumber: true })}
								placeholder="150000"
								className={cn(formErrors.price && "border-destructive")}
							/>
							{formErrors.price && (
								<p className="text-sm text-destructive">
									{formErrors.price.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="surface">Superficie (m²) *</Label>
							<Input
								id="surface"
								type="number"
								{...register("surface", { valueAsNumber: true })}
								placeholder="200"
								className={cn(formErrors.surface && "border-destructive")}
							/>
							{formErrors.surface && (
								<p className="text-sm text-destructive">
									{formErrors.surface.message}
								</p>
							)}
						</div>
					</div>

					{/* Bedrooms and Bathrooms */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="bedrooms">Habitaciones</Label>
							<Input
								id="bedrooms"
								type="number"
								{...register("bedrooms", { valueAsNumber: true })}
								placeholder="3"
								min="0"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bathrooms">Baños</Label>
							<Input
								id="bathrooms"
								type="number"
								{...register("bathrooms", { valueAsNumber: true })}
								placeholder="2"
								min="0"
							/>
						</div>
					</div>

					{/* Characteristics */}
					<div className="space-y-2">
						<Label>Características</Label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{CHARACTERISTICS.map((characteristic) => {
								const isSelected =
									selectedCharacteristics.includes(characteristic);
								return (
									<Button
										key={characteristic}
										type="button"
										variant={isSelected ? "default" : "outline"}
										size="sm"
										onClick={() => handleCharacteristicToggle(characteristic)}
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
							<Label htmlFor="description">Descripción</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleGenerateDescription}
								disabled={!watchedValues.propertyType || generateAI.isPending}
							>
								<Sparkles className="h-4 w-4 mr-2" />
								{generateAI.isPending ? "Generando..." : "Generar con IA"}
							</Button>
						</div>
						<Textarea
							id="description"
							{...register("description")}
							placeholder="Describe las características principales de la propiedad..."
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
