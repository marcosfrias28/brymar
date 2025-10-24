"use client";

import { Bath, Bed, Edit, Eye, MapPin, Square } from "lucide-react";
import { type CardAction, type CardBadge, UnifiedCard } from "./unified-card";

interface PropertyCardProps {
	property: {
		id: string;
		title: string;
		price: number;
		bedrooms: number;
		bathrooms: number;
		area: number;
		location: string;
		type: string;
		images?: string[];
		status?: string;
	};
	showActions?: boolean;
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
}

export function PropertyCard({
	property,
	showActions = true,
	onEdit,
	onView,
}: PropertyCardProps) {
	const badges: CardBadge[] = [
		{
			label: property.type,
			variant: "secondary",
		},
	];

	if (property.status) {
		badges.push({
			label: property.status,
			variant: property.status === "available" ? "default" : "outline",
		});
	}

	const metadata = [
		{ icon: MapPin, label: "Ubicación", value: property.location },
		{ icon: Bed, label: "Habitaciones", value: property.bedrooms.toString() },
		{ icon: Bath, label: "Baños", value: property.bathrooms.toString() },
		{ icon: Square, label: "Área", value: `${property.area} m²` },
	];

	const actions: CardAction[] = [];

	if (showActions) {
		if (onView) {
			actions.push({
				label: "Ver",
				icon: Eye,
				onClick: () => onView(property.id),
				variant: "outline",
			});
		}

		if (onEdit) {
			actions.push({
				label: "Editar",
				icon: Edit,
				onClick: () => onEdit(property.id),
				variant: "default",
			});
		}
	}

	return (
		<UnifiedCard
			title={property.title}
			subtitle={`$${property.price.toLocaleString()} USD`}
			image={property.images?.[0]}
			imageAlt={property.title}
			badges={badges}
			metadata={metadata}
			actions={actions}
			href={!showActions ? `/properties/${property.id}` : undefined}
		/>
	);
}
