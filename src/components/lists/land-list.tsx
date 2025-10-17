"use client";

import { UnifiedList, FilterOption } from "./unified-list";
import { LandCard } from "../cards/land-card";
import { useRouter } from "next/navigation";

interface Land {
  id: string;
  name: string;
  price: number;
  area: number;
  location: string;
  type: string;
  images?: string[];
  status?: string;
}

interface LandListProps {
  lands: Land[];
  isLoading?: boolean;
  error?: string;
  showActions?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

const landFilters: FilterOption[] = [
  {
    key: "type",
    label: "Tipo",
    type: "select",
    placeholder: "Todos los tipos",
    options: [
      { value: "commercial", label: "Comercial" },
      { value: "residential", label: "Residencial" },
      { value: "agricultural", label: "Agrícola" },
      { value: "beachfront", label: "Frente al Mar" },
    ],
  },
  {
    key: "location",
    label: "Ubicación",
    type: "search",
    placeholder: "Buscar por ubicación",
  },
];

export function LandList({
  lands,
  isLoading,
  error,
  showActions = true,
  onSearch,
  onFilter,
}: LandListProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/lands/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/lands/${id}`);
  };

  const handleAdd = () => {
    router.push("/dashboard/lands/new");
  };

  return (
    <UnifiedList
      title="Terrenos"
      items={lands}
      renderItem={(land) => (
        <LandCard
          key={land.id}
          land={land}
          showActions={showActions}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}
      isLoading={isLoading}
      error={error}
      filters={landFilters}
      searchPlaceholder="Buscar terrenos..."
      showAddButton={showActions}
      addButtonText="Nuevo Terreno"
      onAdd={handleAdd}
      onSearch={onSearch}
      onFilter={onFilter}
      emptyMessage="No se encontraron terrenos"
      emptyDescription="Intenta ajustar los filtros o agrega un nuevo terreno"
    />
  );
}
