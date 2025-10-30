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

type PropertyFormProps = {
	initialData?: any;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
};

export function PropertyForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
}: PropertyFormProps) {
	const [propertyType, setPropertyType] = useState(
		initialData?.propertyType || ""
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
						<input name="id" type="hidden" value={initialData.id} />
					)}
					<input
						name="characteristics"
						type="hidden"
						value={JSON.stringify([])}
					/>
					<input name="images" type="hidden" value={JSON.stringify([])} />
					<input name="videos" type="hidden" value={JSON.stringify([])} />
					<input name="status" type="hidden" value="draft" />
					<input name="language" type="hidden" value="es" />

					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Título de la Propiedad *</Label>
						<Input
							defaultValue={initialData?.title || ""}
							id="title"
							name="title"
							placeholder="Ej: Villa de Lujo en Punta Cana"
							required
						/>
						{state?.errors?.title && (
							<p className="text-red-600 text-sm">{state.errors.title[0]}</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							defaultValue={initialData?.description || ""}
							id="description"
							name="description"
							placeholder="Describe las características principales de la propiedad..."
							required
							rows={5}
						/>
						{state?.errors?.description && (
							<p className="text-red-600 text-sm">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Price */}
					<div className="space-y-2">
						<Label htmlFor="price">Precio (USD) *</Label>
						<Input
							defaultValue={initialData?.price || ""}
							id="price"
							name="price"
							placeholder="450000"
							required
							type="number"
						/>
						{state?.errors?.price && (
							<p className="text-red-600 text-sm">{state.errors.price[0]}</p>
						)}
					</div>

					{/* Surface */}
					<div className="space-y-2">
						<Label htmlFor="surface">Área (m²) *</Label>
						<Input
							defaultValue={initialData?.surface || ""}
							id="surface"
							name="surface"
							placeholder="150"
							required
							type="number"
						/>
						{state?.errors?.surface && (
							<p className="text-red-600 text-sm">{state.errors.surface[0]}</p>
						)}
					</div>

					{/* Property Type */}
					<div className="space-y-2">
						<Label htmlFor="propertyType">Tipo de Propiedad *</Label>
						<input name="propertyType" type="hidden" value={propertyType} />
						<Select
							onValueChange={setPropertyType}
							required
							value={propertyType}
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
							<p className="text-red-600 text-sm">
								{state.errors.propertyType[0]}
							</p>
						)}
					</div>

					{/* Bedrooms */}
					<div className="space-y-2">
						<Label htmlFor="bedrooms">Habitaciones</Label>
						<Input
							defaultValue={initialData?.bedrooms || ""}
							id="bedrooms"
							name="bedrooms"
							placeholder="3"
							type="number"
						/>
						{state?.errors?.bedrooms && (
							<p className="text-red-600 text-sm">{state.errors.bedrooms[0]}</p>
						)}
					</div>

					{/* Bathrooms */}
					<div className="space-y-2">
						<Label htmlFor="bathrooms">Baños</Label>
						<Input
							defaultValue={initialData?.bathrooms || ""}
							id="bathrooms"
							name="bathrooms"
							placeholder="2"
							type="number"
						/>
						{state?.errors?.bathrooms && (
							<p className="text-red-600 text-sm">
								{state.errors.bathrooms[0]}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<Button disabled={isPending} type="submit">
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Guardando...
								</>
							) : isEditing ? (
								"Actualizar Propiedad"
							) : (
								"Crear Propiedad"
							)}
						</Button>
						{onCancel && (
							<Button onClick={onCancel} type="button" variant="outline">
								Cancelar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
