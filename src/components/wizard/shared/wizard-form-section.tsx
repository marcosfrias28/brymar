"use client";

import React from "react";
import { cn } from '@/lib/utils';

interface WizardFormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "compact" | "highlighted";
}

export function WizardFormSection({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
}: WizardFormSectionProps) {
  const variantStyles = {
    default: "space-y-4 p-6 rounded-lg border bg-card",
    compact: "space-y-3 p-4 rounded-md border bg-muted/30",
    highlighted: "space-y-4 p-6 rounded-lg border-2 border-primary/20 bg-primary/5",
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      {(title || description) && (
        <div className={cn("space-y-1", headerClassName)}>
          {title && (
            <h3 className="text-lg font-medium leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={cn("space-y-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
}