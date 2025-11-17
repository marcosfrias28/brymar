"use client";

import { useState, useCallback, useMemo } from "react";
import { Heart, MapPin, Bed, Bath, Square, DollarSign, Calendar, Filter, Grid, List, Map, ChevronLeft, ChevronRight, Home, TreePine, Eye, Share2, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "/Users/marcos/Desktop/Dev/brymar/src/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  views?: number;
}

interface Land {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: string;
  area: number;
  images: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  views?: number;
}

interface SearchResultsProps {
  items: Property[] | Land[];
  searchType: "properties" | "lands";
  isLoading: boolean;
  error?: string;
  total: number;
  page: number;
  limit: number;
  view: "grid" | "list" | "map";
  sortBy: string;
  onPageChange: (page: number) => void;
  onViewChange: (view: "grid" | "list" | "map") => void;
  onSortChange: (sort: string) => void;
  onRetry: () => void;
  onFavoriteToggle?: (id: string) => void;
  onShare?: (item: Property | Land) => void;
  onContact?: (item: Property | Land) => void;
  className?: string;
}

export function EnhancedSearchResults({
  items,
  searchType,
  isLoading,
  error,
  total,
  page,
  limit,
  view,
  sortBy,
  onPageChange,
  onViewChange,
  onSortChange,
  onRetry,
  onFavoriteToggle,
  onShare,
  onContact,
  className
}: SearchResultsProps) {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Format price with proper currency formatting
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Format date for better readability
  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  }, []);

  // Handle favorite toggle with accessibility
  const handleFavoriteToggle = useCallback((item: Property | Land, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id);
      toast({
        title: item.isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: `${item.title} ${item.isFavorite ? 'eliminado de' : 'añadido a'} tus favoritos`,
        duration: 2000,
      });
    }
  }, [onFavoriteToggle, toast]);

  // Handle share with accessibility
  const handleShare = useCallback((item: Property | Land, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item);
      toast({
        title: "Compartir",
        description: `Compartiendo ${item.title}`,
        duration: 2000,
      });
    }
  }, [onShare, toast]);

  // Handle contact with accessibility
  const handleContact = useCallback((item: Property | Land, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContact) {
      onContact(item);
      toast({
        title: "Contactar",
        description: `Contactando sobre ${item.title}`,
        duration: 2000,
      });
    }
  }, [onContact, toast]);

  // Get status badge color
  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      venta: { label: 'En Venta', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
      alquiler: { label: 'En Alquiler', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      vendido: { label: 'Vendido', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
      alquilado: { label: 'Alquilado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
      reservado: { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
    };
  }, []);

  // Property/Land card component
  const PropertyCard = useMemo(() => ({ item }: { item: Property | Land }) => {
    const isProperty = 'bedrooms' in item;
    const statusBadge = getStatusBadge(item.status);
    
    return (
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer",
          selectedItem === item.id && "ring-2 ring-primary"
        )}
        onClick={() => setSelectedItem(item.id)}
        role="article"
        aria-label={`${item.title} - ${formatPrice(item.price)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedItem(item.id);
          }
        }}
      >
        {/* Image section with overlay */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={`${item.title} - Imagen principal`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              {searchType === 'properties' ? (
                <Home className="h-12 w-12 text-muted-foreground/50" />
              ) : (
                <TreePine className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
          )}
          
          {/* Status badge */}
          <Badge 
            className={cn("absolute left-3 top-3 text-xs font-medium", statusBadge.color)}
            aria-label={`Estado: ${statusBadge.label}`}
          >
            {statusBadge.label}
          </Badge>

          {/* Action buttons */}
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={(e) => handleFavoriteToggle(item, e)}
                    aria-label={item.isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Heart 
                      className={cn("h-4 w-4", item.isFavorite && "fill-current text-red-500")} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={(e) => handleShare(item, e)}
                    aria-label="Compartir propiedad"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Views counter */}
          {item.views && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
              <Eye className="h-3 w-3" />
              <span>{item.views}</span>
            </div>
          )}
        </div>

        {/* Content section */}
        <CardHeader className="p-4 pb-2">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 font-semibold text-lg leading-tight">
                {item.title}
              </h3>
              <Badge variant="outline" className="text-xs shrink-0">
                {item.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="mb-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>

          {/* Property features */}
          <div className="mb-3 flex flex-wrap gap-2">
            {isProperty ? (
              <>
                <Badge variant="secondary" className="text-xs">
                  <Bed className="mr-1 h-3 w-3" />
                  {item.bedrooms} hab
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Bath className="mr-1 h-3 w-3" />
                  {item.bathrooms} baños
                </Badge>
              </>
            ) : null}
            <Badge variant="secondary" className="text-xs">
              <Square className="mr-1 h-3 w-3" />
              {item.area} m²
            </Badge>
          </div>

          {(() => {
            const raw = ('amenities' in item ? (item as any).amenities : (item as any).features);
            const arr = Array.isArray(raw)
              ? raw
              : raw && typeof raw === 'object'
              ? Object.keys(raw).filter((k) => {
                  try {
                    const v = (raw as any)[k];
                    return v === true || (typeof v === 'string' && v.trim().length > 0);
                  } catch {
                    return false;
                  }
                })
              : typeof raw === 'string'
              ? [raw]
              : [];
            return (
              <>
                {arr.slice(0, 3).map((amenity: string) => (
                  <Badge key={amenity} variant="outline" className="mr-1 mb-1 text-xs">
                    {amenity}
                  </Badge>
                ))}
                {arr.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{arr.length - 3} más</Badge>
                )}
              </>
            );
          })()}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-bold text-primary">
                {formatPrice(item.price)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }, [formatPrice, formatDate, getStatusBadge, handleFavoriteToggle, handleShare, searchType, selectedItem]);

  // Loading skeleton
  const LoadingSkeleton = useMemo(() => ({ count = 6 }: { count?: number }) => (
    <div className={cn(
      "grid gap-4",
      view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-6 w-1/3" />
          </CardFooter>
        </Card>
      ))}
    </div>
  ), [view]);

  // Empty state
  const EmptyState = useMemo(() => () => (
    <div className="flex h-96 flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        {searchType === 'properties' ? (
          <Home className="h-12 w-12 text-muted-foreground" />
        ) : (
          <TreePine className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold">No se encontraron resultados</h3>
      <p className="mb-4 max-w-md text-muted-foreground">
        Intenta ajustar tus filtros de búsqueda o buscar en una ubicación diferente.
      </p>
      <Button onClick={onRetry} variant="outline">
        Intentar de nuevo
      </Button>
    </div>
  ), [searchType, onRetry]);

  // Error state
  const ErrorState = useMemo(() => () => (
    <Alert variant="destructive" className="mx-auto max-w-md">
      <AlertTitle>Error en la búsqueda</AlertTitle>
      <AlertDescription>
        {error || 'Ocurrió un error al buscar propiedades. Por favor, intenta de nuevo.'}
      </AlertDescription>
      <Button onClick={onRetry} variant="outline" className="mt-4">
        Reintentar
      </Button>
    </Alert>
  ), [error, onRetry]);

  // Pagination component
  const Pagination = useMemo(() => () => {
    const totalPages = Math.ceil(total / limit);
    const canGoBack = page > 1;
    const canGoForward = page < totalPages;

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} de {total} resultados
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoBack}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-8 w-8"
                  aria-label={`Ir a página ${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoForward}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }, [page, limit, total, onPageChange]);

  // View controls
  const ViewControls = useMemo(() => () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewChange('grid')}
          aria-label="Vista de cuadrícula"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewChange('list')}
          aria-label="Vista de lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'map' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewChange('map')}
          aria-label="Vista de mapa"
        >
          <Map className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Ordenar resultados"
        >
          <option value="newest">Más recientes</option>
          <option value="price-low">Precio: menor a mayor</option>
          <option value="price-high">Precio: mayor a menor</option>
          <option value="area-large">Área: mayor a menor</option>
          <option value="area-small">Área: menor a mayor</option>
        </select>
      </div>
    </div>
  ), [view, sortBy, onViewChange, onSortChange]);

  // Main content
  if (error) {
    return <ErrorState />;
  }

  if (!isLoading && items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {searchType === 'properties' ? 'Propiedades' : 'Terrenos'} disponibles
          </h2>
          <p className="text-muted-foreground">
            {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <ViewControls />
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSkeleton count={view === 'list' ? 3 : 6} />
      ) : (
        <div className={cn(
          "grid gap-4",
          view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {items.map((item) => (
            <PropertyCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="mt-8">
          <Pagination />
        </div>
      )}

      {/* Accessibility live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading 
          ? `Cargando ${searchType === 'properties' ? 'propiedades' : 'terrenos'}...`
          : `${items.length} ${searchType === 'properties' ? 'propiedades' : 'terrenos'} mostradas`
        }
      </div>
    </div>
  );
}
