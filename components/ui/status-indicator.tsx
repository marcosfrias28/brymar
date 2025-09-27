import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        active:
          "bg-secondary/20 text-secondary-foreground border border-secondary/40",
        pending:
          "bg-secondary/10 text-secondary-foreground/80 border border-secondary/20",
        highlighted:
          "bg-secondary text-secondary-foreground border border-secondary/30",
        success:
          "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        warning:
          "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        error:
          "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        neutral:
          "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        default: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

function StatusIndicator({
  className,
  variant,
  size,
  icon,
  pulse = false,
  children,
  ...props
}: StatusIndicatorProps) {
  return (
    <div
      className={cn(statusIndicatorVariants({ variant, size }), className)}
      {...props}
    >
      {icon && (
        <span className={cn("flex-shrink-0", pulse && "animate-pulse")}>
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

// Dot indicator for simple status display
interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "pending" | "success" | "warning" | "error" | "neutral";
  pulse?: boolean;
}

function StatusDot({
  className,
  variant = "neutral",
  pulse = false,
  ...props
}: StatusDotProps) {
  const dotVariants = {
    active: "bg-secondary border-secondary/60",
    pending: "bg-secondary/60 border-secondary/40",
    success: "bg-green-500 border-green-400",
    warning: "bg-yellow-500 border-yellow-400",
    error: "bg-red-500 border-red-400",
    neutral: "bg-gray-400 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full border",
        dotVariants[variant],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { StatusIndicator, StatusDot, statusIndicatorVariants };
export type { StatusIndicatorProps, StatusDotProps };
