"use client"

import { useState, useMemo } from "react"
import { MapPin, DollarSign, Ruler, TreePine } from "lucide-react"

import { UnifiedPageLayout } from "@/components/shared/unified-page-layout"
import { useLands } from "@/hooks/use-lands"

export default function LandsPage() {

  const [typeFilter, setTypeFilter] = useState<"all" | "commercial" | "residential" | "agricultural" | "beachfront">(
    "all",
  )

  const { lands, loading, error, fetchLands } = useLands(1, { type: typeFilter })

  const filteredByType = useMemo(() => {
    return typeFilter === "all" ? lands : lands.filter((l) => l.type === typeFilter)
  }, [lands, typeFilter])

  const stats = useMemo(() => [
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
  ], [lands])

  const quickFilters = useMemo(() => [
    {
      label: "Punta Cana",
      count: lands.filter((l) => l.location.includes("Punta Cana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "La Romana",
      count: lands.filter((l) => l.location.includes("La Romana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Samaná",
      count: lands.filter((l) => l.location.includes("Samaná")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Frente al Mar",
      count: lands.filter((l) => l.type === "beachfront").length,
      active: false,
      onClick: () => {},
    },
  ], [lands])

  const statusFilters = [
    { 
      label: "Todos", 
      value: "all", 
      active: typeFilter === "all", 
      onClick: () => {
        setTypeFilter("all")
        fetchLands(1, { type: "all" })
      }
    },
    {
      label: "Comerciales",
      value: "commercial",
      active: typeFilter === "commercial",
      onClick: () => {
        setTypeFilter("commercial")
        fetchLands(1, { type: "commercial" })
      },
    },
    {
      label: "Residenciales",
      value: "residential",
      active: typeFilter === "residential",
      onClick: () => {
        setTypeFilter("residential")
        fetchLands(1, { type: "residential" })
      },
    },
    {
      label: "Agrícolas",
      value: "agricultural",
      active: typeFilter === "agricultural",
      onClick: () => {
        setTypeFilter("agricultural")
        fetchLands(1, { type: "agricultural" })
      },
    },
    {
      label: "Frente al Mar",
      value: "beachfront",
      active: typeFilter === "beachfront",
      onClick: () => {
        setTypeFilter("beachfront")
        fetchLands(1, { type: "beachfront" })
      },
    },
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar terrenos</p>
          <button 
            onClick={() => fetchLands()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <UnifiedPageLayout
      title="Gestión de Terrenos"
      stats={stats}
      items={filteredByType}
      itemType="land"
      searchPlaceholder="Buscar terrenos..."
      addNewHref="/dashboard/lands/new"
      addNewLabel="Agregar Terreno"
      quickFilters={quickFilters}
      statusFilters={statusFilters}
    />
  )
}