"use client";

import { useState, useMemo } from "react";
import { MapPin, DollarSign, Ruler, TreePine, Plus } from "lucide-react";
import Link from "next/link";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LandCardList } from "@/components/lands/land-card-list";
import { LandFilters } from "@/components/lands/land-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLands } from "@/presentation/hooks/use-lands";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { RouteGuard } from "@/components/auth/route-guard";
import { cn } from "@/lib/utils";
import {
  secondaryColorClasses,
  badgeVariants,
} from "@/lib/utils/secondary-colors";

export default function LandsPage() {
  const breadcrumbs = useBreadcrumbs();

  const [typeFilter, setTypeFilter] = useState<
    "all" | "commercial" | "residential" | "agricultural" | "beachfront"
  >("all");

  const { lands, loading, error, searchLands } = useLands({
    landType: typeFilter === "all" ? undefined : typeFilter,
  });

  const filteredByType = useMemo(() => {
    return typeFilter === "all"
      ? lands
      : lands.filter((l) => l.type === typeFilter);
  }, [lands, typeFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Total Terrenos",
        value: lands.length,
        icon: <MapPin className="h-5 w-5" />,
        color: "text-arsenic",
      },
      {
        label: "Comerciales",
        value: lands.filter((l) => l.type === "commercial").length,
        icon: <DollarSign className="h-5 w-5" />,
        color: "text-blue-600",
      },
      {
        label: "Residenciales",
        value: lands.filter((l) => l.type === "residential").length,
        icon: <Ruler className="h-5 w-5" />,
        color: "text-green-600",
      },
      {
        label: "Frente al Mar",
        value: lands.filter((l) => l.type === "beachfront").length,
        icon: <TreePine className="h-5 w-5" />,
        color: "text-cyan-600",
      },
    ],
    [lands]
  );

  const handleFilterChange = (newFilter: typeof typeFilter) => {
    setTypeFilter(newFilter);
    searchLands({ landType: newFilter === "all" ? undefined : newFilter }, 1);
  };

  if (error) {
    return (
      <DashboardPageLayout
        title="Gestión de Terrenos"
        description="Administra y gestiona todos los terrenos disponibles"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error al cargar terrenos</p>
            <Button onClick={() => searchLands()} variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  const actions = (
    <Button
      asChild
      className={cn(
        "bg-arsenic hover:bg-blackCoral",
        secondaryColorClasses.focusRing
      )}
    >
      <Link href="/dashboard/lands/new">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Terreno
      </Link>
    </Button>
  );

  return (
    <RouteGuard requiredPermission="lands.manage">
      <DashboardPageLayout
        title="Gestión de Terrenos"
        description="Administra y gestiona todos los terrenos disponibles"
        breadcrumbs={breadcrumbs}
        actions={actions}
        showSearch={true}
        searchPlaceholder="Buscar terrenos..."
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={cn(
                  "transition-all duration-200",
                  secondaryColorClasses.cardHover
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={stat.color}>{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-arsenic">
                    {stat.value}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(badgeVariants.secondarySubtle, "mt-2")}
                  >
                    {stat.value > 0 ? "Disponibles" : "Sin registros"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card
            className={cn("border-blackCoral/20", secondaryColorClasses.accent)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-arsenic">
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LandFilters
                currentFilter={typeFilter}
                onFilterChange={handleFilterChange}
                totalCount={lands.length}
              />
            </CardContent>
          </Card>

          {/* Lands List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-arsenic">
                Terrenos ({filteredByType.length})
              </h2>
              <Badge
                variant="outline"
                className={badgeVariants.secondaryOutline}
              >
                {filteredByType.length} de {lands.length} terrenos
              </Badge>
            </div>

            <LandCardList lands={filteredByType} loading={loading} />
          </div>
        </div>
      </DashboardPageLayout>
    </RouteGuard>
  );
}
