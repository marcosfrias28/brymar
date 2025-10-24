"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
	cardAnimations,
	focusAnimations,
	hoverAnimations,
	pageTransitions,
} from "@/lib/utils/animations";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

const animatedCardVariants = cva(
	cn(
		"rounded-xl border bg-card text-card-foreground shadow",
		"transition-all duration-200 ease-out",
	),
	{
		variants: {
			variant: {
				default: cn(cardAnimations.hoverSubtle, focusAnimations.border),
				interactive: cn(
					cardAnimations.clickable,
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				),
				elevated: cn(
					"shadow-lg",
					hoverAnimations.liftAndGlow,
					focusAnimations.border,
				),
				secondary: cn(
					secondaryColorClasses.accent,
					secondaryColorClasses.accentHover,
					focusAnimations.border,
				),
				ghost: cn(
					"border-transparent shadow-none",
					hoverAnimations.subtle,
					focusAnimations.ring,
				),
			},
			animation: {
				none: "",
				fade: pageTransitions.fadeIn,
				slideUp: pageTransitions.slideUp,
				slideDown: pageTransitions.slideDown,
				scale: "animate-scale-in",
			},
			hover: {
				none: "",
				lift: "hover:-translate-y-1 hover:shadow-lg",
				glow: "hover:shadow-lg hover:shadow-secondary/10",
				scale: "hover:scale-[1.02]",
				border: "hover:border-secondary/30",
			},
		},
		defaultVariants: {
			variant: "default",
			animation: "fade",
			hover: "lift",
		},
	},
);

export interface AnimatedCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof animatedCardVariants> {
	asChild?: boolean;
	clickable?: boolean;
	delay?: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
	(
		{
			className,
			variant,
			animation,
			hover,
			asChild = false,
			clickable = false,
			delay = 0,
			children,
			...props
		},
		ref,
	) => {
		const Component = asChild ? "div" : "div";

		const delayClass =
			delay > 0 ? `animation-delay-${Math.min(delay * 100, 500)}` : "";

		return (
			<Component
				className={cn(
					animatedCardVariants({
						variant: clickable ? "interactive" : variant,
						animation,
						hover,
						className,
					}),
					delayClass,
				)}
				ref={ref}
				role={clickable ? "button" : undefined}
				tabIndex={clickable ? 0 : undefined}
				{...props}
			>
				{children}
			</Component>
		);
	},
);
AnimatedCard.displayName = "AnimatedCard";

const AnimatedCardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
AnimatedCardHeader.displayName = "AnimatedCardHeader";

const AnimatedCardTitle = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
AnimatedCardTitle.displayName = "AnimatedCardTitle";

const AnimatedCardDescription = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
AnimatedCardDescription.displayName = "AnimatedCardDescription";

const AnimatedCardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
AnimatedCardContent.displayName = "AnimatedCardContent";

const AnimatedCardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center p-6 pt-0", className)}
		{...props}
	/>
));
AnimatedCardFooter.displayName = "AnimatedCardFooter";

export {
	AnimatedCard,
	AnimatedCardHeader,
	AnimatedCardFooter,
	AnimatedCardTitle,
	AnimatedCardDescription,
	AnimatedCardContent,
	animatedCardVariants,
};
