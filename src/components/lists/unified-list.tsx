"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { Search, Filter, Grid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export interface FilterOption {
  key: string;
  label: string;
  type: "select" | "search" | "range";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface UnifiedListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  error?: string;
  filters?: FilterOption[];
  searchPlaceholder?: string;
  showViewToggle?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function UnifiedList<T>({
  title,
  items,
  renderItem,
  isLoading = false,
  error,
  filters = [],
  searchPlaceholder = "Buscar...",
  showViewToggle = true,
  showAddButton = false,
  addButtonText = "Agregar",
  onAdd,
  onSearch,
  onFilter,
  className,
  emptyMessage = "No se encontraron elementos",
  emptyDescription = "Intenta ajustar los filtros o agregar nuevos elementos",
}: UnifiedListProps<T>) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const hasActiveFilters = Object.values(filterValues).some(
    (value) => value && value !== ""
  );
  const activeFilterCount = Object.values(filterValues).filter(
    (value) => value && value !== ""
  ).length;

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <InlineErrorState message={error} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showViewToggle && (
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showAddButton && onAdd && (
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {(onSearch || filters.length > 0) && (
        <Card className={cn("border-border", secondaryColorClasses.cardHover)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="default" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={cn("pl-10", secondaryColorClasses.inputFocus)}
                  />
                </div>
              )}

              {filters.map((filter) => (
                <div key={filter.key}>
                  {filter.type === "select" && (
                    <Select
                      value={filterValues[filter.key] || ""}
                      onValueChange={(value) =>
                        handleFilterChange(filter.key, value)
                      }
                    >
                      <SelectTrigger
                        className={secondaryColorClasses.selectFocus}
                      >
                        <SelectValue
                          placeholder={filter.placeholder || filter.label}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "search" && (
                    <Input
                      placeholder={filter.placeholder || filter.label}
                      value={filterValues[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      className={secondaryColorClasses.inputFocus}
                    />
                  )}
                </div>
              ))}
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Filtros activos:
                </span>
                {Object.entries(filterValues).map(([key, value]) => {
                  if (!value) return null;
                  const filter = filters.find((f) => f.key === key);
                  const displayValue =
                    filter?.options?.find((o) => o.value === value)?.label ||
                    value;

                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleFilterChange(key, "")}
                    >
                      {filter?.label}: {displayValue} ×
                    </Badge>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterValues({});
                    setSearchQuery("");
                    onFilter?.({});
                    onSearch?.("");
                  }}
                  className="text-xs h-6 px-2"
                >
                  Limpiar todo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {emptyMessage}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {emptyDescription}
            </p>
            {showAddButton && onAdd && (
              <Button onClick={onAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {addButtonText}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          )}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );
}
