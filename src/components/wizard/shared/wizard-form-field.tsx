"use client";

import React from "react";
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface WizardFormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  fieldClassName?: string;
  layout?: "vertical" | "horizontal";
}

export function WizardFormField({
  label,
  description,
  error,
  required,
  children,
  className,
  labelClassName,
  fieldClassName,
  layout = "vertical",
}: WizardFormFieldProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div className={cn(
      "space-y-2",
      isHorizontal && "grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-start",
      className
    )}>
      {(label || description) && (
        <div className={cn(
          "space-y-1",
          isHorizontal && "sm:pt-2",
          labelClassName
        )}>
          {label && (
            <Label className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive"
            )}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className={cn(
        "space-y-1",
        isHorizontal && "sm:col-span-2",
        fieldClassName
      )}>
        {children}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}