"use client"

import { useState } from "react"
import { MapPin, DollarSign, Ruler, TreePine } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { UnifiedPageLayout } from "@/components/shared/unified-page-layout"

const generateMockLands = () => {
  const types = ["commercial", "residential", "agricultural", "beachfront"]
  const locations = [
    "Bávaro, Punta Cana",
    "La Romana, La Romana",
    "Santiago, Santiago",
    "Las Terrenas, Samaná",
    "Puerto Plata, Puerto Plata",
    "Cap Cana, La Altagracia",
    "Jarabacoa, La Vega",
    "Sosúa, Puerto Plata",
  ]

  const lands = []

  for (let i = 1; i <= 156; i++) {
    const type = types[i % types.length]
    const location = locations[i % locations.length]

    lands.push({
      id: i.toString(),
      name: `Terreno ${type === "commercial" ? "Comercial" : type === "residential" ? "Residencial" : type === "agricultural" ? "Agrícola" : "Frente al Mar"} ${i}`,
      surface: Math.floor(Math.random() * 15000) + 500,
      price: Math.floor(Math.random() * 500000) + 50000,
      location,
      description: `Excelente terreno ${type} en ${location.split(",")[0]} con características únicas para desarrollo.`,
      images: [`/placeholder.svg?height=300&width=400&query=land-${type}-${i}`],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      type,
    })
  }

  return lands
}

const mockLands = generateMockLands()

export default function LandsPage() {
  const { language } = useLangStore()
  const t = translations[language]

  const [typeFilter, setTypeFilter] = useState<"all" | "commercial" | "residential" | "agricultural" | "beachfront">(
    "all",
  )

  const filteredByType = typeFilter === "all" ? mockLands : mockLands.filter((l) => l.type === typeFilter)

  const stats = [
    {
      label: "Total Terrenos",
      value: mockLands.length,
      icon: <MapPin className="h-5 w-5" />,
      color: "text-arsenic",
    },
    {
      label: "Comerciales",
      value: mockLands.filter((l) => l.type === "commercial").length,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      label: "Residenciales",
      value: mockLands.filter((l) => l.type === "residential").length,
      icon: <Ruler className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      label: "Frente al Mar",
      value: mockLands.filter((l) => l.type === "beachfront").length,
      icon: <TreePine className="h-5 w-5" />,
      color: "text-cyan-600",
    },
  ]

  const quickFilters = [
    {
      label: "Punta Cana",
      count: mockLands.filter((l) => l.location.includes("Punta Cana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "La Romana",
      count: mockLands.filter((l) => l.location.includes("La Romana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Samaná",
      count: mockLands.filter((l) => l.location.includes("Samaná")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Frente al Mar",
      count: mockLands.filter((l) => l.type === "beachfront").length,
      active: false,
      onClick: () => {},
    },
  ]

  const statusFilters = [
    { label: "Todos", value: "all", active: typeFilter === "all", onClick: () => setTypeFilter("all") },
    {
      label: "Comerciales",
      value: "commercial",
      active: typeFilter === "commercial",
      onClick: () => setTypeFilter("commercial"),
    },
    {
      label: "Residenciales",
      value: "residential",
      active: typeFilter === "residential",
      onClick: () => setTypeFilter("residential"),
    },
    {
      label: "Agrícolas",
      value: "agricultural",
      active: typeFilter === "agricultural",
      onClick: () => setTypeFilter("agricultural"),
    },
    {
      label: "Frente al Mar",
      value: "beachfront",
      active: typeFilter === "beachfront",
      onClick: () => setTypeFilter("beachfront"),
    },
  ]

  return (
    <UnifiedPageLayout
      title={t.lands}
      stats={stats}
      items={filteredByType}
      itemType="land"
      searchPlaceholder={`${t.search} terrenos...`}
      addNewHref="/dashboard/lands/new"
      addNewLabel={t.addLand}
      quickFilters={quickFilters}
      statusFilters={statusFilters}
    />
  )
}
