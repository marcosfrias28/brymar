"use client";

import {
	Mail,
	Building2,
	Landmark,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ResourceItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
};

type ResourcesSectionProps = {
	items?: ResourceItem[];
	className?: string;
	linkClassName?: string;
	iconClassName?: string;
	showIcons?: boolean;
	closeMenu?: () => void;
};

const resourceItems: ResourceItem[] = [
	{
		icon: Mail,
		href: "/blog",
		label: "Blog",
	},
	{
		icon: Building2,
		href: "/guides",
		label: "Guías",
	},
	{
		icon: Landmark,
		href: "/calculator",
		label: "Calculadora",
	},
];

export function ResourcesSection({
	items = resourceItems,
	className,
	linkClassName = "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
	iconClassName = "h-5 w-5 text-muted-foreground",
	showIcons = true,
	closeMenu,
}: ResourcesSectionProps) {
	const handleClick = () => {
		if (closeMenu) {
			closeMenu();
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
				Recursos
			</h3>
			{items.map((item) => {
				const Icon = item.icon;

				return (
					<Link
						className={linkClassName}
						href={item.href}
						key={item.href}
						onClick={handleClick}
					>
						{showIcons && <Icon className={iconClassName} />}
						<span className="font-medium">{item.label}</span>
					</Link>
				);
			})}
		</div>
	);
}
