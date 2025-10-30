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

type LandFormProps = {
	initialData?: Land;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
	className?: string;
};

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
		<Card className={cn("mx-auto w-full max-w-2xl", className)}>
			<CardHeader>
				<CardTitle>{isEditing ? "Editar Terreno" : "Nuevo Terreno"}</CardTitle>
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
					<input name="utilities" type="hidden" value={JSON.stringify([])} />
					<input name="accessRoads" type="hidden" value={JSON.stringify([])} />
					<input
						name="nearbyLandmarks"
						type="hidden"
						value={JSON.stringify([])}
					/>
					<input name="images" type="hidden" value={JSON.stringify([])} />
					<input name="aerialImages" type="hidden" value={JSON.stringify([])} />
					<input
						name="documentImages"
						type="hidden"
						value={JSON.stringify([])}
					/>
					<input name="status" type="hidden" value="draft" />
					<input name="language" type="hidden" value="es" />
					<input name="tags" type="hidden" value={JSON.stringify([])} />

					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name">Nombre del Terreno *</Label>
						<Input
							defaultValue={initialData?.name || ""}
							id="name"
							name="name"
							placeholder="Ej: Terreno Comercial Bávaro"
							required
						/>
						{state?.errors?.name && (
							<p className="text-red-600 text-sm">{state.errors.name[0]}</p>
						)}
					</div>

					{/* Title (same as name for compatibility) */}
					<input name="title" type="hidden" value={initialData?.name || ""} />

					{/* Type */}
					<div className="space-y-2">
						<Label htmlFor="landType">Tipo de Terreno *</Label>
						<input name="landType" type="hidden" value={landType} />
						<Select onValueChange={setLandType} required value={landType}>
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
							<p className="text-red-600 text-sm">{state.errors.landType[0]}</p>
						)}
					</div>

					{/* Location */}
					<div className="space-y-2">
						<Label htmlFor="location">Ubicación *</Label>
						<Input
							defaultValue={initialData?.location || ""}
							id="location"
							name="location"
							placeholder="Bávaro, Punta Cana"
							required
						/>
						{state?.errors?.location && (
							<p className="text-red-600 text-sm">{state.errors.location[0]}</p>
						)}
					</div>

					{/* Area and Price */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="surface">Superficie (m²) *</Label>
							<Input
								defaultValue={initialData?.area || ""}
								id="surface"
								name="surface"
								placeholder="2500"
								required
								type="number"
							/>
							{state?.errors?.surface && (
								<p className="text-red-600 text-sm">
									{state.errors.surface[0]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Precio (USD) *</Label>
							<Input
								defaultValue={initialData?.price || ""}
								id="price"
								name="price"
								placeholder="180000"
								required
								type="number"
							/>
							{state?.errors?.price && (
								<p className="text-red-600 text-sm">{state.errors.price[0]}</p>
							)}
						</div>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							defaultValue={initialData?.description || ""}
							id="description"
							name="description"
							placeholder="Describe las características principales del terreno..."
							required
							rows={4}
						/>
						{state?.errors?.description && (
							<p className="text-red-600 text-sm">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-4">
						<Button className="flex-1" disabled={isPending} type="submit">
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
								disabled={isPending}
								onClick={onCancel}
								type="button"
								variant="outline"
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
