"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type UnifiedSearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function UnifiedSearchBar({
  placeholder = "Buscar...",
  value,
  onChange,
  className,
  size = "default",
}: UnifiedSearchBarProps) {
  const sizeClasses = {
    default: "h-10",
    sm: "h-8",
    lg: "h-12",
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn(
          "pl-10 pr-4",
          sizeClasses[size],
          "rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-md",
          "hover:border-gray-300 hover:shadow-sm"
        )}
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}