"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
	createPropertyAction,
	updatePropertyAction,
} from "@/lib/actions/property-actions";

const propertyTypeOptions = [
	{ value: "house", label: "Casa" },
	{ value: "apartment", label: "Apartamento" },
	{ value: "villa", label: "Villa" },
	{ value: "condo", label: "Condominio" },
	{ value: "penthouse", label: "Penthouse" },
];

interface PropertyFormProps {
	initialData?: any;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
}

export function PropertyForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
}: PropertyFormProps) {
	const [propertyType, setPropertyType] = useState(
		initialData?.propertyType || "",
	);

	const action = isEditing ? updatePropertyAction : createPropertyAction;
	const [state, formAction, isPending] = useActionState(action, {
		success: false,
	});

	// Handle success
	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || "Property saved successfully");
			onSuccess?.();
		}
	}, [state?.success, state?.message, onSuccess]);

	// Handle errors
	useEffect(() => {
		if (state?.message && !state.success) {
			toast.error(state.message);
		}
	}, [state?.message, state?.success]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? "Editar Propiedad" : "Crear Nueva Propiedad"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="space-y-6">
					{/* Hidden fields */}
					{isEditing && initialData?.id && (
						<input type="hidden" name="id" value={initialData.id} />
					)}
					<input
						type="hidden"
						name="characteristics"
						value={JSON.stringify([])}
					/>
					<input type="hidden" name="images" value={JSON.stringify([])} />
					<input type="hidden" name="videos" value={JSON.stringify([])} />
					<input type="hidden" name="status" value="draft" />
					<input type="hidden" name="language" value="es" />

					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Título de la Propiedad *</Label>
						<Input
							id="title"
							name="title"
							defaultValue={initialData?.title || ""}
							placeholder="Ej: Villa de Lujo en Punta Cana"
							required
						/>
						{state?.errors?.title && (
							<p className="text-sm text-red-600">{state.errors.title[0]}</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={initialData?.description || ""}
							placeholder="Describe las características principales de la propiedad..."
							rows={5}
							required
						/>
						{state?.errors?.description && (
							<p className="text-sm text-red-600">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Price */}
					<div className="space-y-2">
						<Label htmlFor="price">Precio (USD) *</Label>
						<Input
							id="price"
							name="price"
							type="number"
							defaultValue={initialData?.price || ""}
							placeholder="450000"
							required
						/>
						{state?.errors?.price && (
							<p className="text-sm text-red-600">{state.errors.price[0]}</p>
						)}
					</div>

					{/* Surface */}
					<div className="space-y-2">
						<Label htmlFor="surface">Área (m²) *</Label>
						<Input
							id="surface"
							name="surface"
							type="number"
							defaultValue={initialData?.surface || ""}
							placeholder="150"
							required
						/>
						{state?.errors?.surface && (
							<p className="text-sm text-red-600">{state.errors.surface[0]}</p>
						)}
					</div>

					{/* Property Type */}
					<div className="space-y-2">
						<Label htmlFor="propertyType">Tipo de Propiedad *</Label>
						<input type="hidden" name="propertyType" value={propertyType} />
						<Select
							value={propertyType}
							onValueChange={setPropertyType}
							required
						>
							<SelectTrigger>
								<SelectValue placeholder="Seleccionar tipo" />
							</SelectTrigger>
							<SelectContent>
								{propertyTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{state?.errors?.propertyType && (
							<p className="text-sm text-red-600">
								{state.errors.propertyType[0]}
							</p>
						)}
					</div>

					{/* Bedrooms */}
					<div className="space-y-2">
						<Label htmlFor="bedrooms">Habitaciones</Label>
						<Input
							id="bedrooms"
							name="bedrooms"
							type="number"
							defaultValue={initialData?.bedrooms || ""}
							placeholder="3"
						/>
						{state?.errors?.bedrooms && (
							<p className="text-sm text-red-600">{state.errors.bedrooms[0]}</p>
						)}
					</div>

					{/* Bathrooms */}
					<div className="space-y-2">
						<Label htmlFor="bathrooms">Baños</Label>
						<Input
							id="bathrooms"
							name="bathrooms"
							type="number"
							defaultValue={initialData?.bathrooms || ""}
							placeholder="2"
						/>
						{state?.errors?.bathrooms && (
							<p className="text-sm text-red-600">
								{state.errors.bathrooms[0]}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className="animate-spin mr-2 h-4 w-4" />
									Guardando...
								</>
							) : isEditing ? (
								"Actualizar Propiedad"
							) : (
								"Crear Propiedad"
							)}
						</Button>
						{onCancel && (
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancelar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
