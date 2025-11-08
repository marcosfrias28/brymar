"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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
import { generatePropertyDescription } from "@/lib/actions/ai-actions";
import {
	createPropertyAction,
	updatePropertyAction,
} from "@/lib/actions/property-actions";
import type { Geometry } from "@/lib/types/shared";
import {
	type PropertyFormData,
	PropertyFormSchema,
} from "@/schemas/property-schema";
import type { Coordinates } from "@/types/wizard";
import { PropertyType } from "@/types/wizard";

interface PropertyFormProps {
	initialData?: Partial<PropertyFormData>;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
	onSubmit?: (data: PropertyFormData) => Promise<void>;
	onSaveDraft?: (data: PropertyFormData) => Promise<void>;
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
	const router = useRouter();
	const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
		initialData?.features?.coordinates || initialData?.address?.coordinates
	);
	const [address, setAddress] = useState<Record<string, unknown> | undefined>(initialData?.address);
	const [geometry, setGeometry] = useState<Geometry | undefined>(
		initialData?.geometry
	);
	const form = useForm<PropertyFormData>({
		resolver: zodResolver(PropertyFormSchema),
		defaultValues: {
			title: initialData?.title ?? "",
			description: initialData?.description ?? "",
			price: initialData?.price ?? 0,
			surface: initialData?.surface ?? 0,
			propertyType: initialData?.propertyType ?? PropertyType.APARTMENT,
			bedrooms: initialData?.bedrooms ?? undefined,
			bathrooms: initialData?.bathrooms ?? undefined,
		},
	});

	const {
		handleSubmit,
		setValue,
		getValues,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (data: PropertyFormData) => {
		try {
			const formData = new FormData();

			if (isEditing && initialData?.id) {
				formData.append("id", initialData.id);
			}

			formData.append("title", data.title);
			formData.append("description", data.description);
			formData.append("price", String(data.price));
			formData.append("surface", String(data.surface));
			formData.append("propertyType", String(data.propertyType));

			if (data.bedrooms) {
				formData.append("bedrooms", String(data.bedrooms));
			}

			if (data.bathrooms) {
				formData.append("bathrooms", String(data.bathrooms));
			}

			if (coordinates) {
				formData.append("latitude", String(coordinates.latitude));
				formData.append("longitude", String(coordinates.longitude));
			}

			if (address) {
				formData.append("address", JSON.stringify(address));
			}

			if (geometry) {
				formData.append("geometry", JSON.stringify(geometry));
			}

			const result = isEditing
				? await updatePropertyAction(formData)
				: await createPropertyAction(formData);

			if (result.success) {
				toast.success(
					isEditing
						? "Propiedad actualizada correctamente"
						: "Propiedad creada correctamente"
				);
				onSuccess?.();
			} else {
				toast.error(result.error || "Error al guardar la propiedad");
			}
		} catch (error) {
			toast.error("Error inesperado al guardar la propiedad");
		}
	};

	const handleLocationSelect = (newCoordinates: Coordinates, newAddress: Record<string, unknown>, newGeometry?: Geometry) => {
		setCoordinates(newCoordinates);
		setAddress(newAddress);
		setGeometry(newGeometry);
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Información básica</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Título</FormLabel>
									<FormControl>
										<Input placeholder="Ej: Apartamento en Piantini" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe la propiedad..."
											rows={4}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Precio</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="100000"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="surface"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Superficie (m²)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="100"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="propertyType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo de propiedad</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona tipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{propertyTypeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bedrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Habitaciones</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="3"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bathrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Baños</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="2"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe la propiedad..."
											rows={4}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="button"
							variant="outline"
							onClick={async () => {
								try {
									const values = getValues();
									const aiInput = {
										type: String(values.propertyType || ""),
										location: "República Dominicana",
										price: Number(values.price || 0),
										surface: Number(values.surface || 0),
										characteristics: [],
										bedrooms: values.bedrooms,
										bathrooms: values.bathrooms,
									};

									const res = await generatePropertyDescription(aiInput);
									if (res.success && res.data) {
										setValue("description", res.data, {
											shouldDirty: true,
											shouldValidate: true,
										});
										toast.success("Descripción generada");
									} else {
										toast.error(
											res.error || "No se pudo generar la descripción"
										);
									}
								} catch (_e) {
									toast.error("Error al generar la descripción");
								}
							}}
						>
							Generar descripción con IA
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Ubicación</CardTitle>
					</CardHeader>
					<CardContent>
						<InteractiveMap
							onLocationSelect={handleLocationSelect}
							initialCoordinates={coordinates}
							initialAddress={address}
						/>
					</CardContent>
				</Card>

				<div className="flex justify-end space-x-4">
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isEditing ? "Actualizar" : "Crear"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
