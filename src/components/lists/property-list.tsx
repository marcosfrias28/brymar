"use client";

import { UnifiedList, FilterOption } from "./unified-list";
import { PropertyCard } from "../cards/property-card";
import { useRouter } from "next/navigation";

interface Property {
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
}

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  error?: string;
  showActions?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

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

export function PropertyList({
  properties,
  isLoading,
  error,
  showActions = true,
  onSearch,
  onFilter,
}: PropertyListProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/properties/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/properties/${id}`);
  };

  const handleAdd = () => {
    router.push("/dashboard/properties/new");
  };

  return (
    <UnifiedList
      title="Propiedades"
      items={properties}
      renderItem={(property) => (
        <PropertyCard
          key={property.id}
          property={property}
          showActions={showActions}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}
      isLoading={isLoading}
      error={error}
      filters={propertyFilters}
      searchPlaceholder="Buscar propiedades..."
      showAddButton={showActions}
      addButtonText="Nueva Propiedad"
      onAdd={handleAdd}
      onSearch={onSearch}
      onFilter={onFilter}
      emptyMessage="No se encontraron propiedades"
      emptyDescription="Intenta ajustar los filtros o agrega una nueva propiedad"
    />
  );
}
