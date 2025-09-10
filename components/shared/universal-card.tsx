"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Eye, MapPin, Calendar, User, Tag, DollarSign, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

interface UniversalCardProps {
  item: any
  type: "property" | "land" | "blog"
  viewMode: "grid" | "list" | "bento"
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
}

export function UniversalCard({
  item,
  type,
  viewMode,
  onEdit,
  onDelete,
  onView,
}: UniversalCardProps) {
  const [imageError, setImageError] = useState(false)

  // Extract properties based on item type
  const id = item.id
  const title = type === "property" ? item.title : type === "land" ? item.name : item.title
  const description = item.description
  const image = item.images?.[0] || item.image
  const status = item.status
  const price = item.price
  const location = item.location
  const area = type === "land" ? item.surface : item.area
  const author = item.author
  const date = item.createdAt || item.date
  const category = item.category
  const readTime = item.readTime
  const bedrooms = item.bedrooms
  const bathrooms = item.bathrooms

  const getDetailUrl = () => {
    switch (type) {
      case "property":
        return `/dashboard/properties/${id}`
      case "land":
        return `/dashboard/lands/${id}`
      case "blog":
        return `/dashboard/blog/${id}`
      default:
        return "#"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
      case "available":
        return "bg-green-100 text-green-800"
      case "draft":
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sold":
      case "rented":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return ""
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatArea = (area?: number) => {
    if (!area) return ""
    return `${area.toLocaleString()} m²`
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-blackCoral rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Image */}
          <Link href={getDetailUrl()} className="w-24 h-24 flex-shrink-0">
            {image && !imageError ? (
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-blackCoral rounded-lg flex items-center justify-center hover:bg-arsenic transition-colors">
                <span className="text-white text-xs font-medium">Sin imagen</span>
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link href={getDetailUrl()}>
                  <h3 className="font-semibold text-arsenic truncate hover:text-blackCoral transition-colors cursor-pointer">
                    {title}
                  </h3>
                </Link>
                {description && <p className="text-sm text-blackCoral/70 line-clamp-2 mt-1">{description}</p>}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={getDetailUrl()}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${getDetailUrl()}?edit=true`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {status && (
                <Badge className={getStatusColor(status)} variant="secondary">
                  {status}
                </Badge>
              )}

              {price && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(price)}
                </div>
              )}

              {area && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <Ruler className="h-3 w-3" />
                  {formatArea(area)}
                </div>
              )}

              {location && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
              )}

              {author && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <User className="h-3 w-3" />
                  {author}
                </div>
              )}

              {date && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <Calendar className="h-3 w-3" />
                  {date}
                </div>
              )}

              {category && (
                <div className="flex items-center gap-1 text-sm text-blackCoral">
                  <Tag className="h-3 w-3" />
                  {category}
                </div>
              )}

              {readTime && <span className="text-sm text-blackCoral">{readTime} min lectura</span>}

              {bedrooms && <span className="text-sm text-blackCoral">{bedrooms} hab</span>}

              {bathrooms && <span className="text-sm text-blackCoral">{bathrooms} baños</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid and Bento modes
  const cardHeight = viewMode === "bento" ? "h-auto" : "h-80"

  return (
    <div
      className={`bg-white border border-blackCoral rounded-lg overflow-hidden hover:shadow-md transition-shadow ${cardHeight}`}
    >
      {/* Image */}
      <Link href={getDetailUrl()} className="relative h-48 block">
        {image && !imageError ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-blackCoral flex items-center justify-center hover:bg-arsenic transition-colors">
            <span className="text-white font-medium">Sin imagen</span>
          </div>
        )}

        {/* Status badge */}
        {status && (
          <Badge className={`absolute top-2 left-2 ${getStatusColor(status)}`} variant="secondary">
            {status}
          </Badge>
        )}

        {/* Actions */}
        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={getDetailUrl()}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${getDetailUrl()}?edit=true`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={getDetailUrl()}>
          <h3 className="font-semibold text-arsenic line-clamp-2 mb-2 hover:text-blackCoral transition-colors cursor-pointer">
            {title}
          </h3>
        </Link>

        {description && <p className="text-sm text-blackCoral/70 line-clamp-2 mb-3">{description}</p>}

        {/* Metadata */}
        <div className="space-y-2">
          {price && (
            <div className="flex items-center gap-1 text-sm font-medium text-arsenic">
              <DollarSign className="h-3 w-3" />
              {formatPrice(price)}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-blackCoral">
            {area && (
              <div className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {formatArea(area)}
              </div>
            )}

            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
            )}

            {author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {author}
              </div>
            )}

            {date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </div>
            )}

            {category && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {category}
              </div>
            )}

            {readTime && <span>{readTime} min</span>}
            {bedrooms && <span>{bedrooms} hab</span>}
            {bathrooms && <span>{bathrooms} baños</span>}
          </div>
        </div>
      </div>
    </div>
  )
}