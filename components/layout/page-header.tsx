"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeaderProps } from "@/types/layout";
import { cn } from "@/lib/utils";
import { formAnimations, hoverAnimations } from "@/lib/utils/animations";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-6 border-b border-border", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="animate-fade-in">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 flex-1 animate-fade-in animation-delay-100">
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground transition-colors duration-200">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-base max-w-2xl animate-fade-in animation-delay-200">
              {description}
            </p>
          )}
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in animation-delay-300">
          {showSearch && (
            <div className="relative group">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  "transition-colors duration-200 group-focus-within:text-secondary"
                )}
              />
              <Input
                placeholder={searchPlaceholder}
                className={cn(
                  "pl-10 w-full sm:w-64 bg-background border-border",
                  formAnimations.input,
                  "hover:border-secondary/30 transition-all duration-200"
                )}
              />
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2 animate-fade-in animation-delay-400">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
