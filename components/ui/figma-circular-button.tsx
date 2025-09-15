import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface FigmaCircularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const FigmaCircularButton = forwardRef<HTMLButtonElement, FigmaCircularButtonProps>(
  ({ className, size = "lg", icon, children, ...props }, ref) => {
    const sizes = {
      sm: "w-16 h-16",
      md: "w-24 h-24", 
      lg: "w-[153px] h-[153px]"
    };

    const iconSizes = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-[107px] h-[107px]"
    };

    return (
      <button
        className={cn(
          "rounded-full bg-figma-orange flex items-center justify-center",
          "transition-all duration-300 ease-in-out hover:scale-105",
          "shadow-[0_30.667px_76.667px_rgba(0,0,0,0.4)]",
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <div className={cn("flex items-center justify-center", iconSizes[size])}>
            {icon}
          </div>
        )}
        {children}
      </button>
    );
  }
);

FigmaCircularButton.displayName = "FigmaCircularButton";

// Arrow icon component for the circular button
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("fill-current", className)}
    viewBox="0 0 108 109"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M29.0345 29.1456L28.9555 38.0792L64.3737 38.0792L25.8722 76.5806L32.1969 82.9053L70.6984 44.4039L70.6984 79.822L79.632 79.743V29.1456H29.0345Z"
      fill="#050505"
    />
  </svg>
);

export { FigmaCircularButton, ArrowIcon };
