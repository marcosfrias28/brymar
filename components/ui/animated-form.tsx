"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  formAnimations,
  focusAnimations,
  hoverAnimations,
} from "@/lib/utils/animations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const animatedFormVariants = cva("space-y-6", {
  variants: {
    animation: {
      none: "",
      stagger:
        "[&>*]:animate-fade-in [&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300 [&>*:nth-child(4)]:animation-delay-400 [&>*:nth-child(5)]:animation-delay-500",
      slideUp:
        "[&>*]:animate-slide-in-bottom [&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300",
    },
  },
  defaultVariants: {
    animation: "stagger",
  },
});

export interface AnimatedFormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof animatedFormVariants> {}

const AnimatedForm = React.forwardRef<HTMLFormElement, AnimatedFormProps>(
  ({ className, animation, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(animatedFormVariants({ animation }), className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
AnimatedForm.displayName = "AnimatedForm";

// Enhanced Input with animations
export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, error, success, ...props }, ref) => {
    const stateClasses = error
      ? formAnimations.inputError
      : success
      ? formAnimations.valid
      : formAnimations.input;

    return (
      <Input ref={ref} className={cn(stateClasses, className)} {...props} />
    );
  }
);
AnimatedInput.displayName = "AnimatedInput";

// Enhanced Textarea with animations
export interface AnimatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

const AnimatedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AnimatedTextareaProps
>(({ className, error, success, ...props }, ref) => {
  const stateClasses = error
    ? formAnimations.inputError
    : success
    ? formAnimations.valid
    : formAnimations.input;

  return (
    <Textarea ref={ref} className={cn(stateClasses, className)} {...props} />
  );
});
AnimatedTextarea.displayName = "AnimatedTextarea";

// Form Field wrapper with animations
export interface AnimatedFormFieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  delay?: number;
}

const AnimatedFormField = React.forwardRef<
  HTMLDivElement,
  AnimatedFormFieldProps
>(
  (
    {
      className,
      label,
      error,
      success,
      required,
      delay = 0,
      children,
      ...props
    },
    ref
  ) => {
    const delayClass =
      delay > 0 ? `animation-delay-${Math.min(delay * 100, 500)}` : "";

    return (
      <div
        ref={ref}
        className={cn("space-y-2 animate-fade-in", delayClass, className)}
        {...props}
      >
        {label && (
          <Label
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              error && "text-red-500",
              success && "text-green-500"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {children}
        {error && (
          <p className="text-sm text-red-500 animate-fade-in animation-delay-100">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-500 animate-fade-in animation-delay-100">
            {success}
          </p>
        )}
      </div>
    );
  }
);
AnimatedFormField.displayName = "AnimatedFormField";

// Form Grid for responsive layouts
export interface AnimatedFormGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3;
}

const AnimatedFormGrid = React.forwardRef<
  HTMLDivElement,
  AnimatedFormGridProps
>(({ className, columns = 2, children, ...props }, ref) => {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div
      ref={ref}
      className={cn("grid gap-4", gridClass, className)}
      {...props}
    >
      {children}
    </div>
  );
});
AnimatedFormGrid.displayName = "AnimatedFormGrid";

export {
  AnimatedForm,
  AnimatedInput,
  AnimatedTextarea,
  AnimatedFormField,
  AnimatedFormGrid,
  animatedFormVariants,
};
