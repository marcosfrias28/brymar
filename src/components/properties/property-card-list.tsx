"use client";

import { PropertyCard } from "@/components/cards/property-card";
import type { Property } from "@/lib/types/properties";

type PropertyCardListProps = {
	properties: Property[];
	loading?: boolean;
};

export function PropertyCardList({
	properties,
	loading,
}: PropertyCardListProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<div className="animate-pulse" key={i}>
						<div className="mb-4 h-48 rounded-lg bg-gray-200" />
						<div className="mb-2 h-4 rounded bg-gray-200" />
						<div className="h-4 w-3/4 rounded bg-gray-200" />
					</div>
				))}
			</div>
		);
	}

	if (properties.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-gray-500">No properties found.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-2">
			{properties.map((property) => (
				<PropertyCard
					key={property.id}
					property={{
						id: property.id,
						title: property.title,
						price: property.price,
						bedrooms: property.features.bedrooms,
						bathrooms: property.features.bathrooms,
						area: property.features.area,
						location: property.address.city,
						type: property.type,
						images: property.images?.map((img) =>
							typeof img === "string" ? img : img.url
						),
						status: property.status,
					}}
				/>
			))}
		</div>
	);
}
