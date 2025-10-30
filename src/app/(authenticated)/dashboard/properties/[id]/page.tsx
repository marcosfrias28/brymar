"use client";

import { ArrowLeft, Edit3, Eye, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useProperty } from "@/hooks/use-properties";
import { updateProperty as updatePropertyAction } from "@/lib/actions/properties";
import type { Property, PropertyType } from "@/lib/types/properties";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function PropertyDetailPage() {
	const params = useParams();
	const _router = useRouter();

	// Always call hooks before any early return
	const titleId = useId();
	const priceId = useId();
	const [isEditing, setIsEditing] = useState(false);
	const [editedProperty, setEditedProperty] =
		useState<Partial<Property> | null>(null);

	const {
		data: propertyResult,
		isLoading: loading,
		error,
		refetch,
	} = useProperty(params?.id as string);
	const property = propertyResult?.data;

	const [isUpdating, setIsUpdating] = useState(false);
	const [updateState, setUpdateState] = useState<{ success?: boolean } | null>(
		null
	);

	useEffect(() => {
		if (property) {
			setEditedProperty({ ...property });
		}
	}, [property]);

	useEffect(() => {
		if (updateState?.success) {
			setIsEditing(false);
		}
	}, [updateState]);

	// Check if params and params.id exist after hooks
	if (!params?.id) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Propiedades
						</Link>
					</Button>
				}
				breadcrumbs={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Propiedades", href: "/dashboard/properties" },
					{ label: "Error" },
				]}
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
						<Button asChild>
							<Link href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</Link>
						</Button>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	if (loading) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Propiedades
						</Link>
					</Button>
				}
				description="Obteniendo información de la propiedad"
				title="Cargando..."
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">Cargando...</h2>
						<p className="mb-4 text-muted-foreground">
							Cargando información de la propiedad.
						</p>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	if (error || !property) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Propiedades
						</Link>
					</Button>
				}
				description="No se pudo cargar la propiedad"
				title="Error"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">
							Propiedad no encontrada
						</h2>
						<p className="mb-4 text-muted-foreground">
							La propiedad que buscas no existe o ha sido eliminada.
						</p>
						<Button asChild>
							<Link href="/dashboard/properties">Volver a Propiedades</Link>
						</Button>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	const handleSave = async () => {
		if (editedProperty && property) {
			setIsUpdating(true);
			try {
				const updateInput = {
					id: property.id,
					title: editedProperty.title || property.title,
					description: editedProperty.description || property.description,
					price: editedProperty.price || property.price,
					type: editedProperty.type || property.type,
					status: editedProperty.status || property.status,
				};

				const result = await updatePropertyAction(updateInput);

				if (result.success) {
					setUpdateState({ success: true });
					toast.success("Propiedad actualizada exitosamente");
					await refetch();
				} else {
					toast.error(result.error || "Error al actualizar la propiedad");
				}
			} catch (_error) {
				toast.error("Error inesperado al actualizar la propiedad");
			} finally {
				setIsUpdating(false);
			}
		}
	};

	// useEffect duplicato rimosso

	const handleCancel = () => {
		setEditedProperty({ ...property });
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
			// TODO: Implement delete property action
			toast.error("Función de eliminación no implementada aún");
		}
	};

	const currentData = isEditing ? editedProperty : property;
	if (!currentData) {
		return null;
	}

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades", href: "/dashboard/properties" },
		{
			label: currentData?.title || "Propiedad",
		},
	];

	return (
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
			description="Detalles de la propiedad"
			title={currentData.title || "Propiedad"}
		>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button asChild size="sm" variant="ghost">
							<Link href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</Link>
						</Button>
						<div>
							<h1 className="font-bold font-serif text-3xl">
								{isEditing ? "Editando Propiedad" : currentData?.title}
							</h1>
							<div className="mt-1 flex items-center gap-2">
								<Badge
									className={cn(
										"bg-blue-500 text-white",
										secondaryColorClasses.badge
									)}
								>
									{currentData?.type || "Propiedad"}
								</Badge>
							</div>
						</div>
					</div>

					<div className="flex gap-2">
						{isEditing ? (
							<>
								<Button
									className={cn(secondaryColorClasses.interactive)}
									onClick={handleCancel}
									size="sm"
									variant="outline"
								>
									<X className="mr-2 h-4 w-4" />
									Cancelar
								</Button>
								<Button
									className={cn(
										"bg-primary hover:bg-primary/90",
										secondaryColorClasses.focusRing
									)}
									disabled={isUpdating}
									onClick={handleSave}
									size="sm"
								>
									<Save className="mr-2 h-4 w-4" />
									{isUpdating ? "Guardando..." : "Guardar"}
								</Button>
							</>
						) : (
							<>
								<Button
									asChild
									className={cn(secondaryColorClasses.interactive)}
									size="sm"
									variant="outline"
								>
									<Link href={`/dashboard/properties/${params.id}/edit`}>
										<Edit3 className="mr-2 h-4 w-4" />
										Editar con Asistente
									</Link>
								</Button>
								<Button
									className={cn(secondaryColorClasses.interactive)}
									onClick={() => setIsEditing(true)}
									size="sm"
									variant="outline"
								>
									<Edit3 className="mr-2 h-4 w-4" />
									Edición Rápida
								</Button>
								<Button
									className={cn(secondaryColorClasses.interactive)}
									size="sm"
									variant="outline"
								>
									<Eye className="mr-2 h-4 w-4" />
									Vista Previa
								</Button>
								<Button onClick={handleDelete} size="sm" variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Eliminar
								</Button>
							</>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 lg:col-span-2">
						{/* Images */}
						<Card
							className={cn(
								"border shadow-sm transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Imágenes
								</CardTitle>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<div className="space-y-4">
										<p className="text-gray-600 text-sm">
											Gestión de imágenes disponible en modo de edición
										</p>
										<div className="grid grid-cols-2 gap-4">
											{(currentData.images || []).map((image) => {
												const imageUrl =
													typeof image === "string"
														? image
														: image &&
																typeof image === "object" &&
																"url" in image
															? (image.url as string)
															: "/placeholder.svg";
												return (
													<div
														className="relative aspect-video overflow-hidden rounded-lg"
														key={imageUrl}
													>
														<Image
															alt="Property"
															className="object-cover"
															fill
															src={imageUrl}
														/>
													</div>
												);
											})}
										</div>
									</div>
								) : (
									<div className="grid grid-cols-2 gap-4">
										{(currentData.images || []).map((image) => {
											const imageUrl =
												typeof image === "string"
													? image
													: image && typeof image === "object" && "url" in image
														? (image.url as string)
														: "/placeholder.svg";
											return (
												<div
													className="relative aspect-video overflow-hidden rounded-lg"
													key={imageUrl}
												>
													<Image
														alt="Property"
														className="object-cover"
														fill
														src={imageUrl}
													/>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Description */}
						<Card
							className={cn(
								"border shadow-sm transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Descripción
								</CardTitle>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<RichTextEditor
										content={editedProperty?.description || ""}
										onChange={(content) =>
											editedProperty &&
											setEditedProperty({
												...editedProperty,
												description: content,
											})
										}
										placeholder="Describe la propiedad en detalle..."
									/>
								) : (
									<div className="prose prose-sm max-w-none">
										<p className="text-foreground leading-relaxed">
											{currentData.description}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Basic Info */}
						<Card
							className={cn(
								"border shadow-sm transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Información Básica
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{isEditing ? (
									<>
										<div>
											<Label htmlFor={titleId}>Título</Label>
											<Input
												className={cn(secondaryColorClasses.inputFocus)}
												id={titleId}
												onChange={(e) =>
													editedProperty &&
													setEditedProperty({
														...editedProperty,
														title: e.target.value,
													})
												}
												value={editedProperty?.title || ""}
											/>
										</div>
										<div>
											<Label htmlFor="type">Tipo</Label>
											<Select
												onValueChange={(value: PropertyType) =>
													editedProperty &&
													setEditedProperty({
														...editedProperty,
														type: value,
													})
												}
												value={editedProperty?.type || "house"}
											>
												<SelectTrigger
													className={cn(secondaryColorClasses.selectFocus)}
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="sale">En Venta</SelectItem>
													<SelectItem value="rent">En Alquiler</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor={priceId}>Precio (USD)</Label>
											<Input
												className={cn(secondaryColorClasses.inputFocus)}
												id={priceId}
												onChange={(e) =>
													editedProperty &&
													setEditedProperty({
														...editedProperty,
														price: Number(e.target.value),
													})
												}
												type="number"
												value={editedProperty?.price || 0}
											/>
										</div>
										{/* Location field not available in current DTO */}
									</>
								) : (
									<>
										<div>
											<Label className="font-medium text-muted-foreground text-sm">
												Precio
											</Label>
											<p className="font-bold text-2xl text-foreground">
												${currentData?.price?.toLocaleString() || 0} USD
											</p>
										</div>
										{/* Location not available in current DTO */}
									</>
								)}
							</CardContent>
						</Card>

						{/* Property Details */}
						<Card
							className={cn(
								"border shadow-sm transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Detalles
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{isEditing ? (
									<p className="text-muted-foreground text-sm">
										Edición de detalles disponible en modo de edición completo.
									</p>
								) : (
									<>
										{/* Property details (bedrooms, bathrooms, area) not available in current DTO */}
										<p className="text-muted-foreground text-sm">
											Detalles adicionales no disponibles en la estructura
											actual de datos.
										</p>
									</>
								)}
							</CardContent>
						</Card>

						{/* Metadata */}
						<Card
							className={cn(
								"border shadow-sm transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Información Adicional
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div>
										<Label className="font-medium text-muted-foreground text-sm">
											Fecha de Creación
										</Label>
										<p className="text-foreground">
											{currentData.createdAt
												? new Date(currentData.createdAt).toLocaleDateString()
												: ""}
										</p>
									</div>
									<div>
										<Label className="font-medium text-muted-foreground text-sm">
											ID de Propiedad
										</Label>
										<p className="font-mono text-foreground">
											{currentData?.id}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
