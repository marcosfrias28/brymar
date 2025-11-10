"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formAnimations } from "@/lib/utils/animations";

const animatedFormVariants = cva("space-y-6", {
	variants: {
		animation: {
			none: "",
			stagger:
				"[&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300 [&>*:nth-child(4)]:animation-delay-400 [&>*:nth-child(5)]:animation-delay-500 [&>*]:animate-fade-in",
			slideUp:
				"[&>*:nth-child(1)]:animation-delay-100 [&>*:nth-child(2)]:animation-delay-200 [&>*:nth-child(3)]:animation-delay-300 [&>*]:animate-slide-in-bottom",
		},
	},
	defaultVariants: {
		animation: "stagger",
	},
});

export interface AnimatedFormProps
	extends React.FormHTMLAttributes<HTMLFormElement>,
		VariantProps<typeof animatedFormVariants> {}

const AnimatedForm = ({
	className,
	animation,
	children,
	ref,
	...props
}: AnimatedFormProps & { ref?: React.RefObject<HTMLFormElement | null> }) => (
	<form
		className={cn(animatedFormVariants({ animation }), className)}
		ref={ref}
		{...props}
	>
		{children}
	</form>
);
AnimatedForm.displayName = "AnimatedForm";

// Enhanced Input with animations
export interface AnimatedInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	success?: boolean;
}

const AnimatedInput = ({
	className,
	error,
	success,
	ref,
	...props
}: AnimatedInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
	const stateClasses = error
		? formAnimations.inputError
		: success
			? formAnimations.valid
			: formAnimations.input;

	return <Input className={cn(stateClasses, className)} ref={ref} {...props} />;
};
AnimatedInput.displayName = "AnimatedInput";

// Enhanced Textarea with animations
export interface AnimatedTextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
	success?: boolean;
}

const AnimatedTextarea = ({
	className,
	error,
	success,
	ref,
	...props
}: AnimatedTextareaProps & {
	ref?: React.RefObject<HTMLTextAreaElement | null>;
}) => {
	const stateClasses = error
		? formAnimations.inputError
		: success
			? formAnimations.valid
			: formAnimations.input;

	return (
		<Textarea className={cn(stateClasses, className)} ref={ref} {...props} />
	);
};
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

const AnimatedFormField = ({
	className,
	label,
	error,
	success,
	required,
	delay = 0,
	children,
	ref,
	...props
}: AnimatedFormFieldProps & {
	ref?: React.RefObject<HTMLDivElement | null>;
}) => {
	const delayClass =
		delay > 0 ? `animation-delay-${Math.min(delay * 100, 500)}` : "";

	return (
		<div
			className={cn("animate-fade-in space-y-2", delayClass, className)}
			ref={ref}
			{...props}
		>
			{label && (
				<Label
					className={cn(
						"font-medium text-sm transition-colors duration-200",
						error && "text-red-500",
						success && "text-green-500"
					)}
				>
					{label}
					{required && <span className="ml-1 text-red-500">*</span>}
				</Label>
			)}
			{children}
			{error && (
				<p className="animation-delay-100 animate-fade-in text-red-500 text-sm">
					{error}
				</p>
			)}
			{success && (
				<p className="animation-delay-100 animate-fade-in text-green-500 text-sm">
					{success}
				</p>
			)}
		</div>
	);
};
AnimatedFormField.displayName = "AnimatedFormField";

// Form Grid for responsive layouts
export interface AnimatedFormGridProps
	extends React.HTMLAttributes<HTMLDivElement> {
	columns?: 1 | 2 | 3;
}

const AnimatedFormGrid = ({
	className,
	columns = 2,
	children,
	ref,
	...props
}: AnimatedFormGridProps & {
	ref?: React.RefObject<HTMLDivElement | null>;
}) => {
	const gridClass = {
		1: "grid-cols-1",
		2: "grid-cols-1 xl:grid-cols-2",
		3: "grid-cols-1 xl:grid-cols-2 lg:grid-cols-3",
	}[columns];

	return (
		<div
			className={cn("grid gap-4", gridClass, className)}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	);
};
AnimatedFormGrid.displayName = "AnimatedFormGrid";

export {
	AnimatedForm,
	AnimatedInput,
	AnimatedTextarea,
	AnimatedFormField,
	AnimatedFormGrid,
	animatedFormVariants,
};
