"use client";

import { Calculator, Edit, Eye, MapPin, Square, Trash2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteLand } from "@/hooks/use-lands";
import type { Land } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	badgeVariants,
	interactiveClasses,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";

type LandCardProps = {
	land: Land;
	showActions?: boolean;
	variant?: "horizontal" | "vertical";
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
	className?: string;
};

export function LandCard({
	land,
	showActions = true,
	variant = "horizontal",
	onEdit,
	onView,
	className,
}: LandCardProps) {
	const deleteLandMutation = useDeleteLand();

	const surface = land.area;
	const pricePerM2 = surface > 0 ? Math.round(land.price / surface) : 0;
	const hectares = (surface / 10_000).toFixed(4);
	const tareas = (surface / 629).toFixed(2);
	const isVertical = variant === "vertical";

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "commercial":
				return "Comercial";
			case "residential":
				return "Residencial";
			case "agricultural":
				return "Agrícola";
			case "recreational":
				return "Recreativo";
			case "industrial":
				return "Industrial";
			case "mixed-use":
				return "Uso Mixto";
			case "vacant":
				return "Vacante";
			default:
				return type;
		}
	};

	const handleDelete = async () => {
		if (confirm("¿Estás seguro de que quieres eliminar este terreno?")) {
			await deleteLandMutation.mutateAsync(land.id);
		}
	};

	const handleView = () => {
		if (onView) {
			onView(land.id);
		}
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(land.id);
		}
	};

	return (
		<Card
			className={cn(
				"overflow-hidden border-blackCoral/20 shadow-sm transition-all duration-200 hover:shadow-lg",
				secondaryColorClasses.cardHover,
				className
			)}
		>
			<CardContent className="p-0">
				<div
					className={cn(
						"flex",
						isVertical ? "flex-col" : "flex-col sm:flex-row"
					)}
				>
					{/* Image */}
					<div
						className={cn(
							"relative flex-shrink-0 bg-muted",
							isVertical ? "h-48 w-full" : "h-32 w-full sm:h-auto sm:w-48"
						)}
					>
						{land.images?.[0]?.url ? (
							<Image
								alt={land.name}
								className="object-cover"
								fill
								src={land.images[0].url}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-muted">
								<Square className="h-8 w-8 text-muted-foreground" />
							</div>
						)}
						<Badge
							className={cn(
								"absolute top-2 right-2 text-xs capitalize",
								badgeVariants.secondarySubtle
							)}
							variant="secondary"
						>
							{getTypeLabel(land.type)}
						</Badge>
					</div>

					{/* Content */}
					<div
						className={cn(
							"flex-1 p-4",
							isVertical ? "space-y-2" : "flex flex-col justify-between"
						)}
					>
						<div
							className={cn(
								isVertical
									? "space-y-2"
									: "flex items-start justify-between gap-4"
							)}
						>
							<div className="min-w-0 flex-1">
								<h3
									className={cn(
										"mb-1 line-clamp-2 font-semibold text-arsenic",
										isVertical ? "text-lg" : "text-sm"
									)}
								>
									{land.name}
								</h3>

								{land.description && (
									<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
										{land.description}
									</p>
								)}

								<div className="mb-2 flex items-center gap-2 text-blackCoral text-xs">
									<MapPin className="h-3 w-3" />
									<span className="line-clamp-1">
										{land.location || "Ubicación no especificada"}
									</span>
								</div>

								<div className="flex items-center gap-4 text-blackCoral text-xs">
									<div className="flex items-center gap-1">
										<Square className="h-3 w-3" />
										<span>{surface.toLocaleString()}m²</span>
									</div>
									<div className="flex items-center gap-1">
										<Calculator className="h-3 w-3" />
										<span>${pricePerM2.toLocaleString()}/m²</span>
									</div>
								</div>

								<div className="mt-1 text-blackCoral/70 text-xs">
									{hectares} ha • {tareas} tareas
								</div>
							</div>

							<div
								className={cn(
									"flex-shrink-0",
									isVertical
										? "flex w-full items-center justify-between"
										: "text-right"
								)}
							>
								<div
									className={cn(
										"font-bold text-arsenic",
										isVertical ? "text-2xl text-primary" : "text-lg"
									)}
								>
									${land.price.toLocaleString()}
								</div>
								{isVertical && showActions && (
									<Button onClick={handleView} size="sm">
										Ver Detalles
									</Button>
								)}
							</div>
						</div>

						{/* Actions */}
						{showActions && !isVertical && (
							<div className="mt-3 flex gap-2">
								<Button
									className={cn(
										"h-7 bg-transparent px-2 text-xs",
										interactiveClasses.button
									)}
									onClick={handleView}
									size="sm"
									variant="outline"
								>
									<Eye className="mr-1 h-3 w-3" />
									Ver
								</Button>
								<Button
									className={cn(
										"h-7 bg-transparent px-2 text-xs",
										interactiveClasses.button
									)}
									onClick={handleEdit}
									size="sm"
									variant="outline"
								>
									<Edit className="mr-1 h-3 w-3" />
									Editar
								</Button>
								<Button
									className={cn(
										"h-7 bg-transparent px-2 text-red-600 text-xs hover:text-red-700",
										secondaryColorClasses.focusRing
									)}
									disabled={deleteLandMutation.isPending}
									onClick={handleDelete}
									size="sm"
									variant="outline"
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
