"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProperties } from "@/hooks/use-properties";
import type { PropertySearchFilters } from "@/lib/types/properties";
import { PropertyCard } from "../cards/property-card";
import { type FilterOption, UnifiedList } from "../lists/unified-list";

const propertyFilters: FilterOption[] = [
	{
		key: "type",
		label: "Tipo",
		type: "select",
		placeholder: "Todos los tipos",
		options: [
			{ value: "house", label: "Casa" },
			{ value: "apartment", label: "Apartamento" },
			{ value: "villa", label: "Villa" },
			{ value: "condo", label: "Condominio" },
			{ value: "penthouse", label: "Penthouse" },
		],
	},
	{
		key: "location",
		label: "Ubicación",
		type: "search",
		placeholder: "Buscar por ubicación",
	},
	{
		key: "bedrooms",
		label: "Habitaciones",
		type: "select",
		placeholder: "Cualquier cantidad",
		options: [
			{ value: "1", label: "1 habitación" },
			{ value: "2", label: "2 habitaciones" },
			{ value: "3", label: "3 habitaciones" },
			{ value: "4", label: "4+ habitaciones" },
		],
	},
];

type PropertyListWithHooksProps = {
	showActions?: boolean;
	initialFilters?: PropertySearchFilters;
};

export function PropertyListWithHooks({
	showActions = true,
	initialFilters = {},
}: PropertyListWithHooksProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<PropertySearchFilters>(initialFilters);
	const [searchQuery, setSearchQuery] = useState("");

	// Use the properties hook with current filters
	const {
		data: result,
		isLoading,
		error,
	} = useProperties({
		...filters,
		location: searchQuery || filters.location,
	});

	const properties = result || [];

	const handleEdit = (id: string) => {
		router.push(`/dashboard/properties/${id}/edit`);
	};

	const handleView = (id: string) => {
		router.push(`/dashboard/properties/${id}`);
	};

	const handleAdd = () => {
		router.push("/dashboard/properties/new");
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleFilter = (newFilters: Record<string, any>) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
			// Convert string values to appropriate types
			bedrooms: newFilters.bedrooms ? Number(newFilters.bedrooms) : undefined,
			propertyTypes: newFilters.type ? [newFilters.type] : undefined,
		}));
	};

	return (
		<UnifiedList
			addButtonText="Nueva Propiedad"
			emptyDescription="Intenta ajustar los filtros o agrega una nueva propiedad"
			emptyMessage="No se encontraron propiedades"
			error={error ? "Failed to load properties" : undefined}
			filters={propertyFilters}
			isLoading={isLoading}
			items={properties}
			onAdd={handleAdd}
			onFilter={handleFilter}
			onSearch={handleSearch}
			renderItem={(property) => (
				<PropertyCard
					key={property.id}
					onEdit={handleEdit}
					onView={handleView}
					property={{
						id: property.id,
						title: property.title,
						price: property.price,
						bedrooms: property.features.bedrooms,
						bathrooms: property.features.bathrooms,
						area: property.features.area,
						location: property.address.city,
						type: property.type,
						images:
							property.images?.map((img) =>
								typeof img === "string" ? img : img.url
							) || [],
						status: property.status,
					}}
					showActions={showActions}
				/>
			)}
			searchPlaceholder="Buscar propiedades..."
			showAddButton={showActions}
			title="Propiedades"
		/>
	);
}
