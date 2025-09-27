"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTouchDevice } from "@/hooks/use-responsive";

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minSize?: "sm" | "md" | "lg";
  asChild?: boolean;
}

/**
 * TouchTarget component ensures minimum touch target sizes for mobile devices
 * Following WCAG guidelines for minimum 44px touch targets
 */
export function TouchTarget({
  children,
  minSize = "md",
  asChild = false,
  className,
  ...props
}: TouchTargetProps) {
  const isTouch = useTouchDevice();

  const sizeClasses = {
    sm: "min-h-[40px] min-w-[40px]", // 40px minimum
    md: "min-h-[44px] min-w-[44px]", // 44px WCAG recommended
    lg: "min-h-[48px] min-w-[48px]", // 48px for better accessibility
  };

  const touchClasses = cn(
    isTouch && sizeClasses[minSize],
    "touch-manipulation", // Optimize for touch
    className
  );

  if (asChild && React.isValidElement(children)) {
    // For asChild, just add classes to the child element
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(touchClasses, (children as any).props?.className),
    });
  }

  return (
    <div
      className={cn("flex items-center justify-center", touchClasses)}
      {...props}
    >
      {children}
    </div>
  );
}

// Enhanced button component with proper touch targets
interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function TouchButton({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: TouchButtonProps) {
  const isTouch = useTouchDevice();

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
    "disabled:pointer-events-none disabled:opacity-50",
    "touch-manipulation", // Optimize for touch
    // Enhanced touch targets
    isTouch && "min-h-[44px] min-w-[44px]"
  );

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-secondary/20 hover:text-secondary-foreground",
    outline: "border border-input bg-background hover:bg-secondary/20",
  };

  const sizeClasses = {
    sm: cn("h-9 px-3 text-sm", isTouch && "min-h-[40px] px-4"),
    md: cn("h-10 px-4 py-2", isTouch && "min-h-[44px] px-5"),
    lg: cn("h-11 px-8", isTouch && "min-h-[48px] px-9"),
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
