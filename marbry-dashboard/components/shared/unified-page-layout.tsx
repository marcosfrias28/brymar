"use client"

import type React from "react"

import { useState } from "react"
import { CompactStats } from "./compact-stats"
import { CompactToolbar } from "./compact-toolbar"
import { UniversalCard } from "./universal-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface UnifiedPageLayoutProps {
  title: string
  stats: Array<{ label: string; value: string | number; icon: React.ReactNode; color: string }>
  items: Array<any>
  itemType: "property" | "land" | "blog"
  searchPlaceholder: string
  addNewHref: string
  addNewLabel: string
  quickFilters?: Array<{ label: string; count: number; active?: boolean; onClick: () => void }>
  statusFilters?: Array<{ label: string; value: string; active?: boolean; onClick: () => void }>
}

export function UnifiedPageLayout({
  title,
  stats,
  items,
  itemType,
  searchPlaceholder,
  addNewHref,
  addNewLabel,
  quickFilters = [],
  statusFilters = [],
}: UnifiedPageLayoutProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "bento">("grid")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter items based on search
  const filteredItems = items.filter((item) => {
    const searchFields =
      itemType === "property"
        ? [item.title, item.location, item.type]
        : itemType === "land"
          ? [item.name, item.location, item.type]
          : [item.title, item.author, item.category]

    return searchFields.some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blackCoral mb-2">{title}</h1>
        <CompactStats stats={stats} />
      </div>

      {/* Status Filters */}
      {statusFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-blackCoral/70 font-medium">Estado:</span>
          {statusFilters.map((filter, index) => (
            <Button
              key={index}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={filter.onClick}
              className={
                filter.active
                  ? "bg-arsenic text-white hover:bg-blackCoral"
                  : "border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <CompactToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={searchPlaceholder}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredItems.length}
        addNewHref={addNewHref}
        addNewLabel={addNewLabel}
        quickFilters={quickFilters}
      />

      {/* Content Grid */}
      <div
        className={`
        ${viewMode === "grid" ? "grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4" : ""}
        ${viewMode === "list" ? "space-y-3" : ""}
        ${viewMode === "bento" ? "grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 xl:grid-cols-5 gap-4" : ""}
      `}
      >
        {paginatedItems.map((item) => (
          <UniversalCard key={item.id} item={item} type={itemType} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-blackCoral/70">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-blackCoral"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-blackCoral"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
