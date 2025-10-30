"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import {
	getPropertyById,
	updatePropertyAction,
} from "@/lib/actions/properties";
import type { Property } from "@/lib/types/properties";

export default function EditPropertyPage() {
	// All hooks must be called before any conditional returns
	const params = useParams();
	const router = useRouter();
	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const propertyId = params?.id as string;

	// useActionState for handling property updates
	const [updateState, updateAction, isPending] = useActionState(
		updatePropertyAction,
		{ success: false }
	);

	useEffect(() => {
		const loadPropertyData = async () => {
			if (!propertyId) {
				setError("ID de propiedad inválido");
				setLoading(false);
				return;
			}

			try {
				const result = await getPropertyById(propertyId);

				if (!(result.success && result.data)) {
					setError("Propiedad no encontrada");
					setLoading(false);
					return;
				}

				setProperty(result.data);
			} catch (_err) {
				setError("Error al cargar la propiedad");
			} finally {
				setLoading(false);
			}
		};

		loadPropertyData();
	}, [propertyId]);

	// Define breadcrumbs after hooks
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades", href: "/dashboard/properties" },
		{
			label: `Propiedad #${propertyId}`,
			href: `/dashboard/properties/${propertyId}`,
		},
		{ label: "Editar" },
	];

	// Conditional rendering after all hooks are called
	if (!params?.id) {
		return (
			<RouteGuard requiredPermission="properties.manage">
				<DashboardPageLayout
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</Link>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="Propiedad no encontrada"
					title="Error"
				>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<h2 className="mb-2 font-semibold text-xl">
								ID de propiedad no válido
							</h2>
							<p className="mb-4 text-muted-foreground">
								No se pudo encontrar la propiedad solicitada
							</p>
							<Button asChild variant="outline">
								<Link href="/dashboard/properties">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Volver a Propiedades
								</Link>
							</Button>
						</div>
					</div>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	// Handle update state changes
	useEffect(() => {
		if (updateState.success && updateState.data) {
			toast.success("¡Propiedad actualizada exitosamente!");
			router.push(`/dashboard/properties/${propertyId}`);
		} else if (!updateState.success && updateState.error) {
			toast.error(updateState.error);
		}
	}, [updateState, router, propertyId]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateAction(formData);
	};

	if (loading) {
		return (
			<RouteGuard requiredPermission="properties.manage">
				<DashboardPageLayout
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</Link>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="Cargando datos de la propiedad"
					title="Cargando..."
				>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
							<h2 className="mb-2 font-semibold text-xl">
								Cargando propiedad...
							</h2>
							<p className="text-muted-foreground">
								Preparando el editor para la propiedad
							</p>
						</div>
					</div>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	if (error || !property) {
		return (
			<RouteGuard requiredPermission="properties.manage">
				<DashboardPageLayout
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</Link>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="No se pudo cargar la propiedad"
					title="Error"
				>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<h2 className="mb-2 font-semibold text-xl">
								Error al cargar la propiedad
							</h2>
							<p className="mb-4 text-muted-foreground">
								{error || "La propiedad no se pudo cargar para edición"}
							</p>
							<div className="flex justify-center gap-2">
								<Button asChild variant="outline">
									<Link href="/dashboard/properties">
										<ArrowLeft className="mr-2 h-4 w-4" />
										Volver a Propiedades
									</Link>
								</Button>
								<Button asChild>
									<Link href={`/dashboard/properties/${propertyId}`}>
										Ver Propiedad
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Propiedades
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Edita la información de la propiedad"
				title="Editar Propiedad"
			>
				<div className="mx-auto max-w-4xl">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<input name="id" type="hidden" value={propertyId} />

						<div className="space-y-6 rounded-lg bg-white p-6 shadow">
							<div>
								<label
									className="mb-2 block font-medium text-sm"
									htmlFor="title"
								>
									Título
								</label>
								<input
									className="w-full rounded-md border px-3 py-2"
									defaultValue={property.title}
									id="title"
									name="title"
									required
									type="text"
								/>
							</div>

							<div>
								<label
									className="mb-2 block font-medium text-sm"
									htmlFor="description"
								>
									Descripción
								</label>
								<textarea
									className="w-full rounded-md border px-3 py-2"
									defaultValue={property.description || ""}
									id="description"
									name="description"
									rows={4}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										className="mb-2 block font-medium text-sm"
										htmlFor="price"
									>
										Precio
									</label>
									<input
										className="w-full rounded-md border px-3 py-2"
										defaultValue={property.price}
										id="price"
										name="price"
										required
										type="number"
									/>
								</div>

								<div>
									<label
										className="mb-2 block font-medium text-sm"
										htmlFor="type"
									>
										Tipo
									</label>
									<select
										className="w-full rounded-md border px-3 py-2"
										defaultValue={property.type}
										id="type"
										name="type"
										required
									>
										<option value="house">Casa</option>
										<option value="apartment">Apartamento</option>
										<option value="condo">Condominio</option>
										<option value="townhouse">Casa Adosada</option>
										<option value="villa">Villa</option>
										<option value="land">Terreno</option>
										<option value="commercial">Comercial</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<div>
									<label
										className="mb-2 block font-medium text-sm"
										htmlFor="bedrooms"
									>
										Habitaciones
									</label>
									<input
										className="w-full rounded-md border px-3 py-2"
										defaultValue={property.features?.bedrooms || 0}
										id="bedrooms"
										name="bedrooms"
										type="number"
									/>
								</div>

								<div>
									<label
										className="mb-2 block font-medium text-sm"
										htmlFor="bathrooms"
									>
										Baños
									</label>
									<input
										className="w-full rounded-md border px-3 py-2"
										defaultValue={property.features?.bathrooms || 0}
										id="bathrooms"
										name="bathrooms"
										type="number"
									/>
								</div>

								<div>
									<label
										className="mb-2 block font-medium text-sm"
										htmlFor="area"
									>
										Área (m²)
									</label>
									<input
										className="w-full rounded-md border px-3 py-2"
										defaultValue={property.features?.area || 0}
										id="area"
										name="area"
										type="number"
									/>
								</div>
							</div>

							<div>
								<label
									className="mb-2 block font-medium text-sm"
									htmlFor="status"
								>
									Estado
								</label>
								<select
									className="w-full rounded-md border px-3 py-2"
									defaultValue={property.status}
									id="status"
									name="status"
								>
									<option value="draft">Borrador</option>
									<option value="published">Publicado</option>
								</select>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								disabled={isPending}
								onClick={() =>
									router.push(`/dashboard/properties/${propertyId}`)
								}
								type="button"
								variant="outline"
							>
								Cancelar
							</Button>
							<Button disabled={isPending} type="submit">
								{isPending ? "Guardando..." : "Guardar Cambios"}
							</Button>
						</div>
					</form>

					{isPending && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
							<div className="flex items-center gap-3 rounded-lg bg-white p-6">
								<div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
								<span>Guardando cambios...</span>
							</div>
						</div>
					)}
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
