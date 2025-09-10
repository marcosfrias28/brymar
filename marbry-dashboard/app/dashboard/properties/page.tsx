"use client"

import { useState } from "react"
import { Home, DollarSign, Key, TrendingUp } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { UnifiedPageLayout } from "@/components/shared/unified-page-layout"

const generateMockProperties = () => {
  const types = ["sale", "rent"]
  const locations = [
    "Punta Cana, La Altagracia",
    "Santo Domingo, DN",
    "Cap Cana, La Altagracia",
    "Bávaro, La Altagracia",
    "Santiago, Santiago",
    "Puerto Plata, Puerto Plata",
    "La Romana, La Romana",
    "Samaná, Samaná",
    "Jarabacoa, La Vega",
  ]
  const properties = []

  for (let i = 1; i <= 247; i++) {
    properties.push({
      id: i.toString(),
      title: `Propiedad ${i} - ${locations[i % locations.length].split(",")[0]}`,
      type: types[i % 2],
      price: Math.floor(Math.random() * 2000000) + 100000,
      bedrooms: Math.floor(Math.random() * 6) + 1,
      bathrooms: Math.floor(Math.random() * 4) + 1,
      area: Math.floor(Math.random() * 400) + 80,
      location: locations[i % locations.length],
      description: `Hermosa propiedad en ${locations[i % locations.length]} con excelentes acabados y ubicación privilegiada.`,
      images: [`/placeholder.svg?height=300&width=400&query=property-${i}`],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      featured: i % 7 === 0,
    })
  }
  return properties
}

const mockProperties = generateMockProperties()

export default function PropertiesPage() {
  const { language } = useLangStore()
  const t = translations[language]

  const [statusFilter, setStatusFilter] = useState<"all" | "sale" | "rent">("all")

  const filteredByStatus =
    statusFilter === "all" ? mockProperties : mockProperties.filter((p) => p.type === statusFilter)

  const stats = [
    {
      label: "Total Propiedades",
      value: mockProperties.length,
      icon: <Home className="h-5 w-5" />,
      color: "text-arsenic",
    },
    {
      label: "En Venta",
      value: mockProperties.filter((p) => p.type === "sale").length,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      label: "En Alquiler",
      value: mockProperties.filter((p) => p.type === "rent").length,
      icon: <Key className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      label: "Destacadas",
      value: mockProperties.filter((p) => p.featured).length,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-600",
    },
  ]

  const quickFilters = [
    {
      label: "Punta Cana",
      count: mockProperties.filter((p) => p.location.includes("Punta Cana")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Santo Domingo",
      count: mockProperties.filter((p) => p.location.includes("Santo Domingo")).length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Cap Cana",
      count: mockProperties.filter((p) => p.location.includes("Cap Cana")).length,
      active: false,
      onClick: () => {},
    },
    { label: "Destacadas", count: mockProperties.filter((p) => p.featured).length, active: false, onClick: () => {} },
  ]

  const statusFilters = [
    { label: "Todas", value: "all", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
    { label: "En Venta", value: "sale", active: statusFilter === "sale", onClick: () => setStatusFilter("sale") },
    { label: "En Alquiler", value: "rent", active: statusFilter === "rent", onClick: () => setStatusFilter("rent") },
  ]

  return (
    <UnifiedPageLayout
      title={t.properties}
      stats={stats}
      items={filteredByStatus}
      itemType="property"
      searchPlaceholder={`${t.search} propiedades...`}
      addNewHref="/dashboard/properties/new"
      addNewLabel={t.addProperty}
      quickFilters={quickFilters}
      statusFilters={statusFilters}
    />
  )
}
