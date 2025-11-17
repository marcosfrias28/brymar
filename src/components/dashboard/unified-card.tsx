"use client";

import { Building, Calendar, Clock, DollarSign, Edit, Eye, FileText, Home, MapPin, Ruler, Trash2, TreePine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types/blog";
import type { Land } from "@/lib/types";
import type { Property } from "@/lib/types/properties";

export type CardType = "property" | "land" | "blog";

export type CardAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
};

export type CardBadge = {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
};

export type StandardCardProps = {
  type: CardType;
  data: Property | Land | BlogPost;
  actions?: CardAction[];
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  variant?: "grid" | "list";
};

const getPlaceholderIcon = (type: CardType) => {
  switch (type) {
    case "property":
      return Home;
    case "land":
      return TreePine;
    case "blog":
      return FileText;
    default:
      return FileText;
  }
};

const getImageUrl = (data: any, type: CardType): string | undefined => {
  switch (type) {
    case "property": {
      const property = data as Property;
      if (property.images && property.images.length > 0) {
        const firstImage = property.images[0];
        return typeof firstImage === "string" ? firstImage : firstImage?.url;
      }
      return undefined;
    }
    case "land": {
      const land = data as Land;
      if (land.images && land.images.length > 0) {
        const firstImage = land.images[0];
        return typeof firstImage === "string" ? firstImage : (firstImage as any)?.url;
      }
      return undefined;
    }
    case "blog": {
      const blog = data as BlogPost;
      if (blog.coverImage && typeof blog.coverImage === "object" && "url" in blog.coverImage) {
        return (blog.coverImage as any).url;
      }
      return undefined;
    }
    default:
      return undefined;
  }
};

const getBadges = (data: any, type: CardType): CardBadge[] => {
  const badges: CardBadge[] = [];
  switch (type) {
    case "property": {
      const property = data as Property;
      if (property.type) {
        badges.push({
          label: property.type,
          variant: "secondary",
          className: "capitalize"
        });
      }
      if (property.status) {
        badges.push({
          label: property.status === "published" ? "Publicada" : 
                 property.status === "sold" ? "Vendida" :
                 property.status === "rented" ? "Alquilada" : "Borrador",
          variant: property.status === "published" ? "default" : "outline"
        });
      }
      break;
    }
    case "land": {
      const land = data as Land;
      if (land.type) {
        badges.push({
          label: land.type === "residential" ? "Residencial" :
                 land.type === "commercial" ? "Comercial" :
                 land.type === "industrial" ? "Industrial" : "Agrícola",
          variant: "secondary"
        });
      }
      if (land.status) {
        badges.push({
          label: land.status === "published" ? "Publicado" :
                 land.status === "sold" ? "Vendido" :
                 land.status === "reserved" ? "Reservado" : "Borrador",
          variant: land.status === "published" ? "default" : "outline"
        });
      }
      break;
    }
    case "blog": {
      const blog = data as BlogPost;
      if (blog.category) {
        badges.push({
          label: blog.category,
          variant: "secondary"
        });
      }
      if (blog.status) {
        badges.push({
          label: blog.status === "published" ? "Publicado" : "Borrador",
          variant: blog.status === "published" ? "default" : "outline"
        });
      }
      break;
    }
  }
  return badges;
};

const getMetadata = (data: any, type: CardType) => {
  const metadata: Array<{ icon?: React.ComponentType<{ className?: string }>; label: string; value: string }> = [];
  switch (type) {
    case "property": {
      const property = data as Property;
      if (property.address?.city) {
        metadata.push({
          icon: MapPin,
          label: "Ubicación",
          value: property.address.city
        });
      }
      if (property.features?.bedrooms) {
        metadata.push({
          icon: Home,
          label: "Habitaciones",
          value: `${property.features.bedrooms}`
        });
      }
      if (property.features?.bathrooms) {
        metadata.push({
          icon: Building,
          label: "Baños",
          value: `${property.features.bathrooms}`
        });
      }
      if (property.features?.area) {
        metadata.push({
          icon: Ruler,
          label: "Área",
          value: `${property.features.area} m²`
        });
      }
      break;
    }
    case "land": {
      const land = data as Land;
      if (land.location) {
        metadata.push({
          icon: MapPin,
          label: "Ubicación",
          value: land.location
        });
      }
      if (land.area) {
        metadata.push({
          icon: Ruler,
          label: "Área",
          value: `${land.area} m²`
        });
      }
      if (land.price && land.area && land.area > 0) {
        const pricePerSquareMeter = Math.round(land.price / land.area);
        metadata.push({
          icon: DollarSign,
          label: "Precio/m²",
          value: `$${pricePerSquareMeter}/m²`
        });
      }
      break;
    }
    case "blog": {
      const blog = data as BlogPost;
      // For now, we'll skip showing author name since we only have authorId
      // In a real implementation, you'd fetch the author data or pass it as a prop
      if (blog.publishedAt || blog.createdAt) {
        metadata.push({
          icon: Calendar,
          label: "Fecha",
          value: formatDate(blog.publishedAt || blog.createdAt)
        });
      }
      if (blog.readTime) {
        metadata.push({
          icon: Clock,
          label: "Lectura",
          value: `${blog.readTime} min`
        });
      }
      break;
    }
  }
  return metadata;
};

const getDefaultActions = (data: any, type: CardType, onEdit?: (id: string) => void, onView?: (id: string) => void, onDelete?: (id: string) => void): CardAction[] => {
  const actions: CardAction[] = [];
  const id = (data as any).id;
  
  if (onView) {
    actions.push({
      label: "Ver",
      icon: Eye,
      onClick: () => onView(id),
      variant: "outline"
    });
  }
  
  if (onEdit) {
    actions.push({
      label: "Editar",
      icon: Edit,
      onClick: () => onEdit(id),
      variant: "default"
    });
  }
  
  if (onDelete) {
    actions.push({
      label: "Eliminar",
      icon: Trash2,
      onClick: () => {
        if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
          onDelete(id);
        }
      },
      variant: "destructive"
    });
  }
  
  return actions;
};

export function StandardCard({
  type,
  data,
  actions,
  showActions = true,
  onEdit,
  onView,
  onDelete,
  className,
  variant = "grid"
}: StandardCardProps) {
  const title = (data as any).title || (data as any).name || "Sin título";
  const description = (data as any).description || (data as any).excerpt || "";
  const price = (data as any).price;
  
  const imageUrl = getImageUrl(data, type);
  const badges = getBadges(data, type);
  const metadata = getMetadata(data, type);
  const defaultActions = showActions ? getDefaultActions(data, type, onEdit, onView, onDelete) : [];
  const finalActions = actions || defaultActions;
  
  const PlaceholderIcon = getPlaceholderIcon(type);

  if (variant === "list") {
    return (
      <Card className={cn("group transition-all duration-200 hover:shadow-lg", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Image or Placeholder */}
            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              {imageUrl ? (
                <Image
                  alt={title}
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  fill
                  sizes="128px"
                  src={imageUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <PlaceholderIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
                {price && (
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      ${typeof price === "number" ? price.toLocaleString() : price}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {badges.map((badge, index) => (
                    <Badge
                      key={index}
                      className={cn("text-xs", badge.className)}
                      variant={badge.variant}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Metadata */}
              {metadata.length > 0 && (
                <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
                  {metadata.map((item, index) => (
                    <div className="flex items-center gap-1" key={index}>
                      {item.icon && <item.icon className="h-3 w-3" />}
                      <span className="font-medium">{item.label}:</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        {/* Actions */}
        {finalActions.length > 0 && (
          <CardFooter className="flex gap-2 p-4 pt-0">
            {finalActions.map((action, index) => (
              action.href ? (
                <Link key={index} href={action.href}>
                  <Button className={cn("flex-1", action.className)} size="sm" variant={action.variant || "outline"}>
                    {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button key={index} className={cn("flex-1", action.className)} onClick={action.onClick} size="sm" variant={action.variant || "outline"}>
                  {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                  {action.label}
                </Button>
              )
            ))}
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("group overflow-hidden transition-all duration-200 hover:shadow-lg", className)}>
      {/* Image or Placeholder */}
      <div className="relative h-48 w-full overflow-hidden">
        {imageUrl ? (
          <Image
            alt={title}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <PlaceholderIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {badges.slice(0, 2).map((badge, index) => (
              <Badge
                key={index}
                className={cn("text-xs", badge.className)}
                variant={badge.variant}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Price */}
        {price && (
          <div className="mb-3">
            <div className="font-bold text-xl">
              ${typeof price === "number" ? price.toLocaleString() : price}
            </div>
          </div>
        )}
        
        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
            {metadata.map((item, index) => (
              <div className="flex items-center gap-1" key={index}>
                {item.icon && <item.icon className="h-3 w-3" />}
                <span className="font-medium">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Actions */}
      {finalActions.length > 0 && (
        <CardFooter className="flex gap-2 p-4 pt-0">
          {finalActions.map((action, index) => (
            action.href ? (
              <Link key={index} href={action.href}>
                <Button className={cn("flex-1", action.className)} size="sm" variant={action.variant || "outline"}>
                  {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button key={index} className={cn("flex-1", action.className)} onClick={action.onClick} size="sm" variant={action.variant || "outline"}>
                {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                {action.label}
              </Button>
            )
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
