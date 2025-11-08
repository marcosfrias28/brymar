"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveMap } from "@/components/wizard/shared/interactive-map";
import { createPropertyAction } from "@/lib/actions/property-actions";
import type { Geometry } from "@/lib/types/shared";
import type {
	PropertyWizardData,
	Coordinates,
	Address,
} from "@/types/property-wizard";
import { PropertyType } from "@/types/wizard";

interface PropertyFormProps {
	initialData?: Partial<PropertyWizardData>;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
	onSubmit?: (data: PropertyWizardData) => Promise<void>;
	onSaveDraft?: (data: PropertyWizardData) => Promise<void>;
	isLoading?: boolean;
}

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
	{ value: PropertyType.HOUSE, label: "Casa" },
	{ value: PropertyType.APARTMENT, label: "Apartamento" },
	{ value: PropertyType.VILLA, label: "Villa" },
	{ value: PropertyType.COMMERCIAL, label: "Comercial" },
	{ value: PropertyType.LAND, label: "Terreno" },
];

export function PropertyForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
}: PropertyFormProps) {
	const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
		initialData?.coordinates
	);
	const [address, setAddress] = useState<Address | undefined>(
		initialData?.address
	);
	const [formData, setFormData] = useState<Partial<PropertyWizardData>>({
		title: initialData?.title ?? "",
		description: initialData?.description ?? "",
		price: initialData?.price ?? 0,
		surface: initialData?.surface ?? 0,
		propertyType: initialData?.propertyType ?? PropertyType.APARTMENT,
		bedrooms: initialData?.bedrooms ?? undefined,
		bathrooms: initialData?.bathrooms ?? undefined,
		characteristics: initialData?.characteristics ?? [],
		images: initialData?.images ?? [],
		language: initialData?.language ?? "es",
	});

	const handleSubmit = async (data: PropertyWizardData) => {
		try {
			// Convert PropertyWizardData to FormData for the action
			const actionFormData = new FormData();
			actionFormData.append("title", data.title || "");
			actionFormData.append("description", data.description || "");
			actionFormData.append("price", String(data.price || 0));
			actionFormData.append("surface", String(data.surface || 0));
			actionFormData.append("propertyType", data.propertyType || "apartment");

			if (data.bedrooms) {
				actionFormData.append("bedrooms", String(data.bedrooms));
			}
			if (data.bathrooms) {
				actionFormData.append("bathrooms", String(data.bathrooms));
			}
			if (data.address) {
				actionFormData.append("address", JSON.stringify(data.address));
			}
			if (data.coordinates) {
				actionFormData.append("coordinates", JSON.stringify(data.coordinates));
			}

			const result = await createPropertyAction(
				{ success: false, data: { id: "" }, errors: {} },
				actionFormData
			);

			if (result.success) {
				toast.success(
					isEditing
						? "Propiedad actualizada correctamente"
						: "Propiedad creada correctamente"
				);
				onSuccess?.();
			} else {
				toast.error("Error al guardar la propiedad");
			}
		} catch (error) {
			toast.error("Error inesperado al guardar la propiedad");
		}
	};

	const updateField = (field: keyof PropertyWizardData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit(formData as PropertyWizardData);
			}}
			className="space-y-6"
		>
			<Card>
				<CardHeader>
					<CardTitle>Información básica</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Título</label>
						<Input
							placeholder="Ej: Apartamento en Piantini"
							value={formData.title || ""}
							onChange={(e) => updateField("title", e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Descripción</label>
						<Textarea
							placeholder="Describe la propiedad..."
							rows={4}
							value={formData.description || ""}
							onChange={(e) => updateField("description", e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Precio</label>
							<Input
								type="number"
								placeholder="100000"
								value={formData.price || ""}
								onChange={(e) => updateField("price", Number(e.target.value))}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Superficie (m²)</label>
							<Input
								type="number"
								placeholder="100"
								value={formData.surface || ""}
								onChange={(e) => updateField("surface", Number(e.target.value))}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Tipo de propiedad</label>
							<Select
								value={formData.propertyType || ""}
								onValueChange={(value) =>
									updateField("propertyType", value as PropertyType)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona tipo" />
								</SelectTrigger>
								<SelectContent>
									{propertyTypeOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Habitaciones</label>
							<Input
								type="number"
								placeholder="3"
								value={formData.bedrooms || ""}
								onChange={(e) =>
									updateField("bedrooms", Number(e.target.value))
								}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Baños</label>
							<Input
								type="number"
								placeholder="2"
								value={formData.bathrooms || ""}
								onChange={(e) =>
									updateField("bathrooms", Number(e.target.value))
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Ubicación</CardTitle>
				</CardHeader>
				<CardContent>
					<InteractiveMap
						coordinates={coordinates}
						onCoordinatesChange={(coords) => setCoordinates(coords)}
						onAddressChange={(addr) => setAddress(addr)}
					/>
				</CardContent>
			</Card>

			<div className="flex justify-end space-x-4">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
				)}
				<Button type="submit">{isEditing ? "Actualizar" : "Crear"}</Button>
			</div>
		</form>
	);
}
