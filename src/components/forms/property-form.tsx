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

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
	{ value: PropertyType.HOUSE, label: "Casa" },
	{ value: PropertyType.APARTMENT, label: "Apartamento" },
	{ value: PropertyType.VILLA, label: "Villa" },
	{ value: PropertyType.COMMERCIAL, label: "Comercial" },
	{ value: PropertyType.LAND, label: "Terreno" },
];

export function PropertyForm({ initialData, onSubmit, onSaveDraft, isLoading }: PropertyFormProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
	const [address, setAddress] = useState<any | undefined>(initialData?.address);
	const [geometry, setGeometry] = useState<Geometry | undefined>(
		initialData?.geometry
	);
	const form = useForm<PropertyFormData>({
		resolver: zodResolver(PropertyFormSchema),
		defaultValues: {
			title: initialData?.title ?? "",
			description: initialData?.description ?? "",
			price: initialData?.price ?? ("" as unknown as number),
			surface: initialData?.surface ?? ("" as unknown as number),
			propertyType: initialData?.propertyType ?? undefined,
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
			if (data.bedrooms !== undefined) {
				formData.append("bedrooms", String(data.bedrooms));
			}
			if (data.bathrooms !== undefined) {
				formData.append("bathrooms", String(data.bathrooms));
			}

			// Campos que el Server Action espera (en ausencia, usa defaults)
			// characteristics -> default [] en el servidor (puede causar error por esquema estricto)
			formData.append("characteristics", JSON.stringify([]));

			// Ubicación y geometría
			if (coordinates) {
				formData.append("coordinates", JSON.stringify(coordinates));
			}
			if (address) {
				formData.append("address", JSON.stringify(address));
			}
			if (geometry) {
				formData.append("geometry", JSON.stringify(geometry));
			}

			// images/videos pueden omitirse; el servidor usa valores por defecto

			const action = isEditing ? updatePropertyAction : createPropertyAction;

			const result = await action({ success: false } as any, formData);

			if (result?.success) {
				toast.success(
					result.message ||
						(isEditing ? "Propiedad actualizada" : "Propiedad creada")
				);
				onSuccess?.();
			} else if (result?.errors) {
				// Mapear errores del server a RHF
				Object.entries(result.errors).forEach(([field, messages]) => {
					const msg = Array.isArray(messages) ? messages[0] : String(messages);
					// Sólo seteamos errores para campos visibles
					if (
						[
							"title",
							"description",
							"price",
							"surface",
							"propertyType",
							"bedrooms",
							"bathrooms",
						].includes(field)
					) {
						form.setError(field as any, { message: msg });
					}
				});
				if (result.message) {
					toast.error(result.message);
				}
			} else if (result?.message) {
				toast.error(result.message);
			}
		} catch (error) {
			const msg =
				error instanceof Error
					? error.message
					: "Error al enviar el formulario";
			// Manejo especial para redirecciones en Server Actions
			if (msg.includes("NEXT_REDIRECT")) {
				// Next se encargará de la navegación
				return;
			}
			toast.error(msg);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? "Editar Propiedad" : "Crear Nueva Propiedad"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						{/* Título */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Título de la Propiedad *</FormLabel>
									<FormControl>
										<Input
											placeholder="Ej: Villa de Lujo en Punta Cana"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Descripción */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Descripción *</FormLabel>
										<Button
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

													const res =
														await generatePropertyDescription(aiInput);
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
											type="button"
											variant="outline"
										>
											Generar descripción (IA)
										</Button>
									</div>
									<FormControl>
										<Textarea
											placeholder="Describe las características principales de la propiedad..."
											rows={5}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Información Básica - 4 campos en fila en desktop, 2 por fila en tablet/móvil */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							{/* Precio */}
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Precio (USD) *</FormLabel>
										<FormControl>
											<Input
												placeholder="450000"
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Área */}
							<FormField
								control={form.control}
								name="surface"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Área (m²) *</FormLabel>
										<FormControl>
											<Input
												placeholder="150"
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tipo de Propiedad */}
							<FormField
								control={form.control}
								name="propertyType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Propiedad *</FormLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Seleccionar tipo" />
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

							{/* Habitaciones */}
							<FormField
								control={form.control}
								name="bedrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Habitaciones</FormLabel>
										<FormControl>
											<Input
												placeholder="0"
												type="number"
												{...field}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : undefined
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Baños */}
							<FormField
								control={form.control}
								name="bathrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Baños</FormLabel>
										<FormControl>
											<Input
												placeholder="0"
												type="number"
												{...field}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : undefined
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Ubicación */}
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Ubicación</h3>

							{/* Mapa Interactivo */}
							<div className="space-y-2">
								<label className="font-medium text-sm">
									Ubicación en el mapa
								</label>
								<InteractiveMap
									coordinates={coordinates}
									height="280px"
									onAddressChange={(addr: any) => {
										setAddress(addr);
										form.setValue("address", addr);
									}}
									onCoordinatesChange={(coords: Coordinates) => {
										setCoordinates(coords);
										form.setValue("coordinates", coords);
									}}
									onGeometryChange={(geom: Geometry) => {
										setGeometry(geom);
										form.setValue("geometry", geom);
									}}
								/>
							</div>
						</div>

						{/* Botones */}
						<div className="flex gap-4 pt-6">
							<Button
								className="flex-1"
								onClick={() => router.push("/dashboard/properties")}
								type="button"
								variant="outline"
							>
								Cancelar
							</Button>
							<Button
								className="flex-1"
								disabled={form.formState.isSubmitting}
								type="submit"
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{initialData ? "Actualizando..." : "Creando..."}
									</>
								) : initialData ? (
									"Actualizar Propiedad"
								) : (
									"Crear Propiedad"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
