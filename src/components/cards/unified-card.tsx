"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type CardAction = {
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
	href?: string;
	variant?:
		| "default"
		| "outline"
		| "destructive"
		| "secondary"
		| "ghost"
		| "link";
	className?: string;
};

export type CardBadge = {
	label: string;
	variant?: "default" | "secondary" | "destructive" | "outline";
	className?: string;
};

export type UnifiedCardProps = {
	title: string;
	subtitle?: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	badges?: CardBadge[];
	actions?: CardAction[];
	metadata?: Array<{
		icon?: React.ComponentType<{ className?: string }>;
		label: string;
		value: string;
	}>;
	href?: string;
	className?: string;
	imageClassName?: string;
	contentClassName?: string;
	footerClassName?: string;
	onClick?: () => void;
};

export function UnifiedCard({
	title,
	subtitle,
	description,
	image,
	imageAlt,
	badges = [],
	actions = [],
	metadata = [],
	href,
	className,
	imageClassName,
	contentClassName,
	footerClassName,
	onClick,
}: UnifiedCardProps) {
	const CardWrapper = href ? Link : "div";
	const cardProps = href ? { href } : onClick ? { onClick } : {};

	return (
		<CardWrapper {...(cardProps as any)}>
			<Card
				className={cn(
					"group border-border transition-all duration-200 hover:shadow-lg",
					secondaryColorClasses.cardHover,
					onClick && "cursor-pointer",
					className
				)}
			>
				{image && (
					<div
						className={cn(
							"relative h-48 w-full overflow-hidden rounded-t-lg",
							imageClassName
						)}
					>
						<Image
							alt={imageAlt || title}
							className="object-cover transition-transform duration-200 group-hover:scale-105"
							fill
							src={image}
						/>
						{badges.length > 0 && (
							<div className="absolute top-2 left-2 flex flex-wrap gap-1">
								{badges.slice(0, 2).map((badge, index) => (
									<Badge
										className={cn("text-xs", badge.className)}
										key={index}
										variant={badge.variant}
									>
										{badge.label}
									</Badge>
								))}
							</div>
						)}
					</div>
				)}

				<CardContent className={cn("p-4", contentClassName)}>
					<div className="space-y-2">
						<div>
							<h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
								{title}
							</h3>
							{subtitle && (
								<p className="text-muted-foreground text-sm">{subtitle}</p>
							)}
						</div>

						{description && (
							<p className="line-clamp-3 text-muted-foreground text-sm">
								{description}
							</p>
						)}

						{!image && badges.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{badges.map((badge, index) => (
									<Badge
										className={cn("text-xs", badge.className)}
										key={index}
										variant={badge.variant}
									>
										{badge.label}
									</Badge>
								))}
							</div>
						)}

						{metadata.length > 0 && (
							<div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
								{metadata.map((item, index) => (
									<div className="flex items-center gap-1" key={index}>
										{item.icon && <item.icon className="h-3 w-3" />}
										<span className="font-medium">{item.label}:</span>
										<span>{item.value}</span>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>

				{actions.length > 0 && (
					<CardFooter className={cn("flex gap-2 p-4 pt-0", footerClassName)}>
						{actions.map((action, index) => {
							const ActionWrapper = action.href ? Link : "div";
							const actionProps = action.href ? { href: action.href } : {};

							return (
								<ActionWrapper key={index} {...(actionProps as any)}>
									<Button
										className={cn("flex-1", action.className)}
										onClick={action.onClick}
										size="sm"
										variant={action.variant || "outline"}
									>
										{action.icon && <action.icon className="mr-1 h-4 w-4" />}
										{action.label}
									</Button>
								</ActionWrapper>
							);
						})}
					</CardFooter>
				)}
			</Card>
		</CardWrapper>
	);
}
