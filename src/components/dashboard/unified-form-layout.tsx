"use client";

import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type FormAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
};

export type UnifiedFormLayoutProps = {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: FormAction[];
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  loading?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
};

export function UnifiedFormLayout({
  title,
  description,
  breadcrumbs = [],
  actions = [],
  children,
  className,
  headerClassName,
  contentClassName,
  showBackButton = true,
  backButtonHref,
  loading = false,
  onSave,
  onCancel,
}: UnifiedFormLayoutProps) {
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
              <Link href={backButtonHref || "/dashboard"}>
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
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => {
            const ActionWrapper = action.href ? Link : "div";
            const actionProps = action.href ? { href: action.href } : {};
            
            return (
              <ActionWrapper key={index} {...(actionProps as any)}>
                <Button
                  className={cn(action.className, secondaryColorClasses.focusRing)}
                  disabled={action.disabled || loading}
                  onClick={action.onClick}
                  variant={action.variant || "outline"}
                  size="sm"
                >
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              </ActionWrapper>
            );
          })}
          
          {/* Default Cancel and Save buttons */}
          {onCancel && (
            <Button
              className={cn(secondaryColorClasses.focusRing)}
              disabled={loading}
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
          
          {onSave && (
            <Button
              className={cn(secondaryColorClasses.focusRing)}
              disabled={loading}
              onClick={onSave}
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <div className="max-w-full flex-1 space-y-4 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-8 xl:p-6">
        {/* Header */}
        {renderHeader()}
        
        {/* Content */}
        <main
          aria-label={`${title} - Formulario`}
          className={cn("w-full flex-1", contentClassName)}
        >
          <Card className="border-border shadow-lg">
            <CardContent className="p-6">
              {children}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}