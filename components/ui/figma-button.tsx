import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface FigmaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "pill" | "circular";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
}

const FigmaButton = forwardRef<HTMLButtonElement, FigmaButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, ...props }, ref) => {
    const baseStyles = "font-sofia-pro font-medium transition-all duration-300 ease-in-out";
    
    const variants = {
      primary: "bg-figma-orange text-black hover:bg-opacity-90 rounded-full",
      secondary: "bg-white text-black hover:bg-gray-100 rounded-full border border-gray-200",
      pill: "bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3",
      circular: "figma-circular-button text-black hover:scale-105"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-12 py-6 text-xl"
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          variant !== "circular" && sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

FigmaButton.displayName = "FigmaButton";

export { FigmaButton };
