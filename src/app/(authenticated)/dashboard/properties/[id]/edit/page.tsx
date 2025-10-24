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
		{ success: false },
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

				if (!result.success || !result.data) {
					setError("Propiedad no encontrada");
					setLoading(false);
					return;
				}

				setProperty(result.data);
			} catch (err) {
				console.error("Error loading property:", err);
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
	if (!params || !params.id) {
		return (
			<RouteGuard requiredPermission="properties.manage">
				<DashboardPageLayout
					title="Error"
					description="Propiedad no encontrada"
					breadcrumbs={breadcrumbs}
				>
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<h2 className="text-xl font-semibold mb-2">
								ID de propiedad no válido
							</h2>
							<p className="text-muted-foreground mb-4">
								No se pudo encontrar la propiedad solicitada
							</p>
							<Button variant="outline" asChild>
								<Link href="/dashboard/properties">
									<ArrowLeft className="h-4 w-4 mr-2" />
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
					title="Cargando..."
					description="Cargando datos de la propiedad"
					breadcrumbs={breadcrumbs}
				>
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<h2 className="text-xl font-semibold mb-2">
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
					title="Error"
					description="No se pudo cargar la propiedad"
					breadcrumbs={breadcrumbs}
				>
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<h2 className="text-xl font-semibold mb-2">
								Error al cargar la propiedad
							</h2>
							<p className="text-muted-foreground mb-4">
								{error || "La propiedad no se pudo cargar para edición"}
							</p>
							<div className="flex gap-2 justify-center">
								<Button variant="outline" asChild>
									<Link href="/dashboard/properties">
										<ArrowLeft className="h-4 w-4 mr-2" />
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
				title="Editar Propiedad"
				description="Edita la información de la propiedad"
				breadcrumbs={breadcrumbs}
			>
				<div className="max-w-4xl mx-auto">
					<form onSubmit={handleSubmit} className="space-y-6">
						<input type="hidden" name="id" value={propertyId} />
						
						<div className="bg-white rounded-lg shadow p-6 space-y-6">
							<div>
								<label htmlFor="title" className="block text-sm font-medium mb-2">
									Título
								</label>
								<input
									type="text"
									id="title"
									name="title"
									defaultValue={property.title}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>

							<div>
								<label htmlFor="description" className="block text-sm font-medium mb-2">
									Descripción
								</label>
								<textarea
									id="description"
									name="description"
									defaultValue={property.description || ""}
									rows={4}
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label htmlFor="price" className="block text-sm font-medium mb-2">
										Precio
									</label>
									<input
										type="number"
										id="price"
										name="price"
										defaultValue={property.price}
										className="w-full px-3 py-2 border rounded-md"
										required
									/>
								</div>

								<div>
									<label htmlFor="type" className="block text-sm font-medium mb-2">
										Tipo
									</label>
									<select
										id="type"
										name="type"
										defaultValue={property.type}
										className="w-full px-3 py-2 border rounded-md"
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
									<label htmlFor="bedrooms" className="block text-sm font-medium mb-2">
										Habitaciones
									</label>
									<input
										type="number"
										id="bedrooms"
										name="bedrooms"
										defaultValue={property.features?.bedrooms || 0}
										className="w-full px-3 py-2 border rounded-md"
									/>
								</div>

								<div>
									<label htmlFor="bathrooms" className="block text-sm font-medium mb-2">
										Baños
									</label>
									<input
										type="number"
										id="bathrooms"
										name="bathrooms"
										defaultValue={property.features?.bathrooms || 0}
										className="w-full px-3 py-2 border rounded-md"
									/>
								</div>

								<div>
									<label htmlFor="area" className="block text-sm font-medium mb-2">
										Área (m²)
									</label>
									<input
										type="number"
										id="area"
										name="area"
										defaultValue={property.features?.area || 0}
										className="w-full px-3 py-2 border rounded-md"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="status" className="block text-sm font-medium mb-2">
									Estado
								</label>
								<select
									id="status"
									name="status"
									defaultValue={property.status}
									className="w-full px-3 py-2 border rounded-md"
								>
									<option value="draft">Borrador</option>
									<option value="published">Publicado</option>
								</select>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push(`/dashboard/properties/${propertyId}`)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Guardando..." : "Guardar Cambios"}
							</Button>
						</div>
					</form>

					{isPending && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 flex items-center gap-3">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
								<span>Guardando cambios...</span>
							</div>
						</div>
					)}
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
