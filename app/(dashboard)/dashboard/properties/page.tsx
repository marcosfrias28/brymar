"use client";

import { useState } from "react";
import { Home, DollarSign, Key, TrendingUp } from "lucide-react";
import { UnifiedPageLayout } from "@/components/shared/unified-page-layout";
import { useProperties } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { RouteGuard } from "@/components/auth/route-guard";

export default function PropertiesPage() {

  const [statusFilter, setStatusFilter] = useState<"all" | "sale" | "rent">(
    "all"
  );

  const { properties, loading, error, refreshProperties } = useProperties();

  const filteredByStatus =
    statusFilter === "all"
      ? properties
      : properties.filter((p) => p.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">
            Cargando...
          </h2>
          <p className="text-blackCoral mb-4">Cargando propiedades.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">
            Error al cargar propiedades
          </h2>
          <p className="text-blackCoral mb-4">{error}</p>
          <Button onClick={refreshProperties}>Reintentar</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Propiedades",
      value: properties.length,
      icon: <Home className="h-5 w-5" />,
      color: "text-arsenic",
    },
    {
      label: "En Venta",
      value: properties.filter((p) => p.status === "sale").length,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      label: "En Alquiler",
      value: properties.filter((p) => p.status === "rent").length,
      icon: <Key className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      label: "Destacadas",
      value: properties.filter((p) => p.id % 7 === 0).length,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-600",
    },
  ];

  const quickFilters = [
    {
      label: "Punta Cana",
      count: properties.filter((p) => p.location.includes("Punta Cana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Santo Domingo",
      count: properties.filter((p) => p.location.includes("Santo Domingo"))
        .length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Cap Cana",
      count: properties.filter((p) => p.location.includes("Cap Cana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Destacadas",
      count: properties.filter((p) => p.id % 7 === 0).length,
      active: false,
      onClick: () => {},
    },
  ];

  const statusFilters = [
    {
      label: "Todas",
      value: "all",
      active: statusFilter === "all",
      onClick: () => setStatusFilter("all"),
    },
    {
      label: "En Venta",
      value: "sale",
      active: statusFilter === "sale",
      onClick: () => setStatusFilter("sale"),
    },
    {
      label: "En Alquiler",
      value: "rent",
      active: statusFilter === "rent",
      onClick: () => setStatusFilter("rent"),
    },
  ];

  return (
    <RouteGuard requiredPermission="canManageProperties">
      <UnifiedPageLayout
        title="Gestión de Propiedades"
        stats={stats}
        items={filteredByStatus}
        itemType="property"
        searchPlaceholder="Buscar propiedades..."
        addNewHref="/dashboard/properties/new"
        addNewLabel="Agregar Propiedad"
        quickFilters={quickFilters}
        statusFilters={statusFilters}
      />
    </RouteGuard>
  );
}