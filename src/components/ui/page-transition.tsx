"use client";

import * as React from "react";
import { memo, useMemo, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from '@/lib/utils';
import {
  pageTransitions,
  getReducedMotionClasses,
} from '@/lib/utils/animations';

const pageTransitionVariants = cva("w-full", {
  variants: {
    variant: {
      fade: getReducedMotionClasses(pageTransitions.fadeIn, "opacity-100"),
      slideUp: getReducedMotionClasses(
        pageTransitions.slideUp,
        "transform-none"
      ),
      slideDown: getReducedMotionClasses(
        pageTransitions.slideDown,
        "transform-none"
      ),
      slideLeft: getReducedMotionClasses(
        pageTransitions.slideLeft,
        "transform-none"
      ),
      slideRight: getReducedMotionClasses(
        pageTransitions.slideRight,
        "transform-none"
      ),
      none: "",
    },
    stagger: {
      none: "",
      children: getReducedMotionClasses(
        "[&>*]:animate-fade-in [&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300 [&>*:nth-child(4)]:animation-delay-400 [&>*:nth-child(5)]:animation-delay-500",
        "[&>*]:opacity-100"
      ),
      list: getReducedMotionClasses(
        "[&>*]:animate-slide-in-bottom [&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300 [&>*:nth-child(4)]:animation-delay-400 [&>*:nth-child(5)]:animation-delay-500",
        "[&>*]:transform-none [&>*]:opacity-100"
      ),
    },
  },
  defaultVariants: {
    variant: "fade",
    stagger: "none",
  },
});

export interface PageTransitionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageTransitionVariants> {
  delay?: number;
}

const PageTransition = memo(
  React.forwardRef<HTMLDivElement, PageTransitionProps>(
    ({ className, variant, stagger, delay = 0, children, ...props }, ref) => {
      // Memoize delay class calculation
      const delayClass = useMemo(
        () =>
          delay > 0 ? `animation-delay-${Math.min(delay * 100, 500)}` : "",
        [delay]
      );

      // Memoize combined classes
      const combinedClasses = useMemo(
        () =>
          cn(
            pageTransitionVariants({ variant, stagger }),
            delayClass,
            className
          ),
        [variant, stagger, delayClass, className]
      );

      return (
        <div ref={ref} className={combinedClasses} {...props}>
          {children}
        </div>
      );
    }
  )
);
PageTransition.displayName = "PageTransition";

/**
 * Staggered list component for animating list items with delays
 */
export interface StaggeredListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: React.ReactNode[];
  delay?: number;
  animation?: "fade" | "slideUp" | "slideLeft";
}

const StaggeredList = memo(
  React.forwardRef<HTMLDivElement, StaggeredListProps>(
    ({ className, items, delay = 100, animation = "fade", ...props }, ref) => {
      // Memoize animation class
      const animationClass = useMemo(
        () =>
          ({
            fade: getReducedMotionClasses("animate-fade-in", "opacity-100"),
            slideUp: getReducedMotionClasses(
              "animate-slide-in-bottom",
              "transform-none opacity-100"
            ),
            slideLeft: getReducedMotionClasses(
              "animate-slide-in-right",
              "transform-none opacity-100"
            ),
          }[animation]),
        [animation]
      );

      // Memoize rendered items to prevent unnecessary re-renders
      const renderedItems = useMemo(
        () =>
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                animationClass,
                `animation-delay-${Math.min(index * delay, 500)}`
              )}
            >
              {item}
            </div>
          )),
        [items, animationClass, delay]
      );

      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {renderedItems}
        </div>
      );
    }
  )
);
StaggeredList.displayName = "StaggeredList";

/**
 * Grid animation component for animating grid items
 */
export interface AnimatedGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: React.ReactNode[];
  columns?: number;
  delay?: number;
}

const AnimatedGrid = memo(
  React.forwardRef<HTMLDivElement, AnimatedGridProps>(
    ({ className, items, columns = 3, delay = 100, ...props }, ref) => {
      // Memoize grid class calculation
      const gridClass = useMemo(
        () =>
          ({
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"),
        [columns]
      );

      // Memoize animation class with reduced motion support
      const animationClass = useMemo(
        () =>
          getReducedMotionClasses(
            "animate-scale-in",
            "transform-none opacity-100"
          ),
        []
      );

      // Memoize rendered items
      const renderedItems = useMemo(
        () =>
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                animationClass,
                `animation-delay-${Math.min(index * delay, 500)}`
              )}
            >
              {item}
            </div>
          )),
        [items, animationClass, delay]
      );

      return (
        <div
          ref={ref}
          className={cn("grid gap-4", gridClass, className)}
          {...props}
        >
          {renderedItems}
        </div>
      );
    }
  )
);
AnimatedGrid.displayName = "AnimatedGrid";

export { PageTransition, StaggeredList, AnimatedGrid, pageTransitionVariants };
