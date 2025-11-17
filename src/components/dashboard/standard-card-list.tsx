"use client";

import { StandardCard } from "@/components/dashboard/unified-card";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types/blog";
import type { Land } from "@/lib/types";
import type { Property } from "@/lib/types/properties";

type CardData = Property | Land | BlogPost;

export type StandardCardListProps = {
  items: CardData[];
  type: "property" | "land" | "blog";
  variant?: "grid" | "list";
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export function StandardCardList({
  items,
  type,
  variant = "grid",
  loading = false,
  showActions = true,
  onEdit,
  onView,
  onDelete,
  className,
}: StandardCardListProps) {
  if (loading) {
    if (variant === "list") {
      return (
        <div className={className}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-4 animate-pulse">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="h-20 w-32 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("grid gap-6", variant === "grid" ? "grid-cols-1 lg:grid-cols-3 xl:grid-cols-2" : "space-y-4", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-4 h-48 rounded-lg bg-gray-200" />
            <div className="mb-2 h-4 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("flex min-h-[200px] items-center justify-center", className)}>
        <div className="text-center">
          <p className="text-muted-foreground">
            {type === "property" ? "No se encontraron propiedades" :
             type === "land" ? "No se encontraron terrenos" :
             "No se encontraron posts del blog"}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((item) => (
          <StandardCard
            key={(item as any).id}
            type={type}
            data={item}
            variant="list"
            showActions={showActions}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", "grid-cols-1 lg:grid-cols-3 xl:grid-cols-2", className)}>
      {items.map((item) => (
        <StandardCard
          key={(item as any).id}
          type={type}
          data={item}
          variant="grid"
          showActions={showActions}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}