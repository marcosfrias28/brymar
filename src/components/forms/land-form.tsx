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
import { createLandAction, updateLandAction } from "@/lib/actions/land-actions";
import type { Land } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LandFormProps {
	initialData?: Land;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
	className?: string;
}

export function LandForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
	className,
}: LandFormProps) {
	const [landType, setLandType] = useState(initialData?.type || "");

	const action = isEditing ? updateLandAction : createLandAction;
	const [state, formAction, isPending] = useActionState(action, {
		success: false,
	});

	// Handle success
	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || "Land listing saved successfully");
			onSuccess?.();
		}
	}, [state?.success, state?.message, onSuccess]);

	// Handle errors
	useEffect(() => {
		if (state?.message && !state.success) {
			toast.error(state.message);
		}
	}, [state?.message, state?.success]);

	const landTypes = [
		{ value: "residential", label: "Residencial" },
		{ value: "commercial", label: "Comercial" },
		{ value: "agricultural", label: "Agrícola" },
		{ value: "beachfront", label: "Frente a la Playa" },
	];

	return (
		<Card className={cn("w-full max-w-2xl mx-auto", className)}>
			<CardHeader>
				<CardTitle>{isEditing ? "Editar Terreno" : "Nuevo Terreno"}</CardTitle>
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
					<input type="hidden" name="utilities" value={JSON.stringify([])} />
					<input type="hidden" name="accessRoads" value={JSON.stringify([])} />
					<input
						type="hidden"
						name="nearbyLandmarks"
						value={JSON.stringify([])}
					/>
					<input type="hidden" name="images" value={JSON.stringify([])} />
					<input type="hidden" name="aerialImages" value={JSON.stringify([])} />
					<input
						type="hidden"
						name="documentImages"
						value={JSON.stringify([])}
					/>
					<input type="hidden" name="status" value="draft" />
					<input type="hidden" name="language" value="es" />
					<input type="hidden" name="tags" value={JSON.stringify([])} />

					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name">Nombre del Terreno *</Label>
						<Input
							id="name"
							name="name"
							defaultValue={initialData?.name || ""}
							placeholder="Ej: Terreno Comercial Bávaro"
							required
						/>
						{state?.errors?.name && (
							<p className="text-sm text-red-600">{state.errors.name[0]}</p>
						)}
					</div>

					{/* Title (same as name for compatibility) */}
					<input type="hidden" name="title" value={initialData?.name || ""} />

					{/* Type */}
					<div className="space-y-2">
						<Label htmlFor="landType">Tipo de Terreno *</Label>
						<input type="hidden" name="landType" value={landType} />
						<Select value={landType} onValueChange={setLandType} required>
							<SelectTrigger>
								<SelectValue placeholder="Seleccionar tipo" />
							</SelectTrigger>
							<SelectContent>
								{landTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{state?.errors?.landType && (
							<p className="text-sm text-red-600">{state.errors.landType[0]}</p>
						)}
					</div>

					{/* Location */}
					<div className="space-y-2">
						<Label htmlFor="location">Ubicación *</Label>
						<Input
							id="location"
							name="location"
							defaultValue={initialData?.location || ""}
							placeholder="Bávaro, Punta Cana"
							required
						/>
						{state?.errors?.location && (
							<p className="text-sm text-red-600">{state.errors.location[0]}</p>
						)}
					</div>

					{/* Area and Price */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="surface">Superficie (m²) *</Label>
							<Input
								id="surface"
								name="surface"
								type="number"
								defaultValue={initialData?.area || ""}
								placeholder="2500"
								required
							/>
							{state?.errors?.surface && (
								<p className="text-sm text-red-600">
									{state.errors.surface[0]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Precio (USD) *</Label>
							<Input
								id="price"
								name="price"
								type="number"
								defaultValue={initialData?.price || ""}
								placeholder="180000"
								required
							/>
							{state?.errors?.price && (
								<p className="text-sm text-red-600">{state.errors.price[0]}</p>
							)}
						</div>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={initialData?.description || ""}
							placeholder="Describe las características principales del terreno..."
							rows={4}
							required
						/>
						{state?.errors?.description && (
							<p className="text-sm text-red-600">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-4">
						<Button type="submit" disabled={isPending} className="flex-1">
							{isPending ? (
								<>
									<Loader2 className="animate-spin mr-2 h-4 w-4" />
									Guardando...
								</>
							) : isEditing ? (
								"Actualizar Terreno"
							) : (
								"Crear Terreno"
							)}
						</Button>
						{onCancel && (
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isPending}
							>
								Cancelar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
