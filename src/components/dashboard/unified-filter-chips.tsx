"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type FilterChip = {
  label: string;
  value: string;
  count?: number;
  active: boolean;
  onClick: () => void;
};

export type UnifiedFilterChipsProps = {
  chips: FilterChip[];
  className?: string;
  variant?: "default" | "pill";
  showCounts?: boolean;
};

export function UnifiedFilterChips({
  chips,
  className,
  variant = "pill",
  showCounts = true,
}: UnifiedFilterChipsProps) {
  if (!chips || chips.length === 0) {
    return null;
  }

  if (variant === "default") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {chips.map((chip) => (
          <Button
            key={chip.value}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              chip.active
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:border-secondary/30 hover:bg-secondary/10"
            )}
            onClick={chip.onClick}
            size="sm"
            variant={chip.active ? "default" : "outline"}
          >
            <span>{chip.label}</span>
            {showCounts && chip.count !== undefined && (
              <Badge
                className={cn(
                  "ml-1 text-xs",
                  chip.active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
                variant={chip.active ? "secondary" : "outline"}
              >
                {chip.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => (
        <Button
          key={chip.value}
          className={cn(
            "flex items-center gap-2 rounded-full transition-all duration-200 px-4 py-2",
            chip.active
              ? cn(
                  "bg-emerald-100 text-emerald-900 shadow-sm hover:bg-emerald-200",
                  "border border-emerald-200"
                )
              : cn(
                  "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
                  "shadow-sm hover:shadow-md"
                )
          )}
          onClick={chip.onClick}
          size="sm"
          variant={chip.active ? "default" : "outline"}
        >
          <span className="font-medium">{chip.label}</span>
          {showCounts && chip.count !== undefined && (
            <Badge
              className={cn(
                "text-xs rounded-full px-2 py-1",
                chip.active
                  ? "bg-emerald-200 text-emerald-800"
                  : "bg-gray-100 text-gray-600"
              )}
              variant={chip.active ? "secondary" : "outline"}
            >
              {chip.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}