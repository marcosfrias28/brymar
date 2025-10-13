"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from '@/lib/utils';
import {
  animationPresets,
  buttonAnimations,
  hoverAnimations,
  focusAnimations,
} from '@/lib/utils/animations';

const animatedButtonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    buttonAnimations.press
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary text-primary-foreground shadow",
          "hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md",
          focusAnimations.ring
        ),
        destructive: cn(
          "bg-destructive text-destructive-foreground shadow-sm",
          "hover:bg-destructive/90 hover:scale-[1.02]",
          focusAnimations.ring
        ),
        outline: cn(
          "border border-input bg-background shadow-sm",
          hoverAnimations.gentle,
          "hover:scale-[1.02]",
          focusAnimations.ring
        ),
        secondary: cn(
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:scale-[1.02] hover:shadow-md",
          focusAnimations.ring
        ),
        ghost: cn(
          hoverAnimations.subtle,
          "hover:scale-[1.02]",
          focusAnimations.ring
        ),
        link: cn(
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
          focusAnimations.ring
        ),
        // New animated variants
        glow: cn(
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 hover:scale-105 hover:shadow-xl hover:shadow-primary/25",
          "active:scale-95",
          focusAnimations.ring,
          "transition-all duration-300 ease-out"
        ),
        bounce: cn(
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:animate-bounce-subtle",
          "active:scale-95",
          focusAnimations.ring
        ),
        shimmer: cn(
          "bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%]",
          "text-primary-foreground shadow-md",
          "hover:animate-pulse hover:scale-[1.02]",
          "active:scale-95",
          focusAnimations.ring
        ),
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
      animation: {
        none: "",
        subtle: "hover:scale-[1.02] active:scale-98",
        bounce: "hover:animate-bounce-subtle",
        glow: "hover:shadow-lg hover:shadow-current/25",
        pulse: "hover:animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
    },
  }
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          animatedButtonVariants({ variant, size, animation, className }),
          loading && buttonAnimations.loading
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {loading ? loadingText || "Loading..." : children}
      </Comp>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };
