"use client";

import { LandCard } from "./land-card";
import { Land } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LandCardListProps {
  lands: Land[];
  variant?: "horizontal" | "vertical";
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function LandCardList({
  lands,
  variant = "horizontal",
  showActions = true,
  onEdit,
  onView,
  className,
}: LandCardListProps) {
  if (lands.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "gap-4",
        variant === "vertical"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4",
        className
      )}
    >
      {lands.map((land) => (
        <LandCard
          key={land.id}
          land={land}
          variant={variant}
          showActions={showActions}
          onEdit={onEdit}
          onView={onView}
        />
      ))}
    </div>
  );
}
