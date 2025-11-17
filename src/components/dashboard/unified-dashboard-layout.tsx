"use client";

import { ArrowLeft, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnifiedFilterChips } from "@/components/dashboard/unified-filter-chips";
import { UnifiedSearchBar } from "@/components/dashboard/unified-search-bar";
import { UnifiedStatsCards } from "@/components/dashboard/unified-stats-cards";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type DashboardHeaderAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
};

export type UnifiedDashboardLayoutProps = {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  stats?: Array<{
    title: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    description?: string;
    change?: string;
  }>;
  filterChips?: Array<{
    label: string;
    value: string;
    count?: number;
    active: boolean;
    onClick: () => void;
  }>;
  actions?: DashboardHeaderAction[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
};

export function UnifiedDashboardLayout({
  title,
  description,
  breadcrumbs = [],
  stats = [],
  filterChips = [],
  actions = [],
  searchPlaceholder = "Buscar...",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  loading = false,
  children,
  className,
  headerClassName,
  contentClassName,
  showBackButton = false,
  backButtonHref = "/dashboard",
}: UnifiedDashboardLayoutProps) {
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
              {crumb.href ? (
                <Link
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  href={crumb.href}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderHeader = () => (
    <div className={cn("mb-6", headerClassName)}>
      {renderBreadcrumbs()}
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          {showBackButton && (
            <Button
              asChild
              className={cn("mb-3", secondaryColorClasses.focusRing)}
              variant="outline"
              size="sm"
            >
              <Link href={backButtonHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          )}
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const ActionWrapper = action.href ? Link : "div";
              const actionProps = action.href ? { href: action.href } : {};
              
              return (
                <ActionWrapper key={index} {...(actionProps as any)}>
                  <Button
                    className={cn(action.className, secondaryColorClasses.focusRing)}
                    onClick={action.onClick}
                    variant={action.variant || "default"}
                    size="sm"
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                </ActionWrapper>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Search */}
      {showSearch && onSearchChange && (
        <div className="mt-4">
          <UnifiedSearchBar
            className="max-w-md"
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <div className="max-w-full flex-1 space-y-4 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-8 xl:p-6">
        {/* Header */}
        {renderHeader()}
        
        {/* Stats Cards */}
        {stats.length > 0 && (
          <div className="mb-6">
            <UnifiedStatsCards
              loading={loading}
              stats={stats}
            />
          </div>
        )}
        
        {/* Filter Chips */}
        {filterChips.length > 0 && (
          <div className="mb-6">
            <UnifiedFilterChips
              chips={filterChips}
              variant="pill"
            />
          </div>
        )}
        
        {/* Content */}
        <main
          aria-label={`${title} - Contenido principal`}
          className={cn("w-full flex-1", contentClassName)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}