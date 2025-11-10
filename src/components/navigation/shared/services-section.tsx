"use client";

import { Shield, Users, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ServiceItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
	description: string;
};

type ServicesSectionProps = {
	items?: ServiceItem[];
	className?: string;
	linkClassName?: string;
	iconClassName?: string;
	showIcons?: boolean;
	closeMenu?: () => void;
};

const serviceItems: ServiceItem[] = [
	{
		icon: Shield,
		href: "/services/valuation",
		label: "Valuación",
		description: "Evaluación profesional",
	},
	{
		icon: Users,
		href: "/services/consulting",
		label: "Consultoría",
		description: "Asesoría especializada",
	},
	{
		icon: Settings,
		href: "/services/legal",
		label: "Legal",
		description: "Trámites legales",
	},
];

export function ServicesSection({
	items = serviceItems,
	className,
	linkClassName = "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
	iconClassName = "h-5 w-5 text-muted-foreground",
	showIcons = true,
	closeMenu,
}: ServicesSectionProps) {
	const handleClick = () => {
		if (closeMenu) {
			closeMenu();
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
				Servicios
			</h3>
			{items.map((item) => {
				const Icon = item.icon;

				return (
					<Link
						className={cn(linkClassName, "block")}
						href={item.href}
						key={item.href}
						onClick={handleClick}
					>
						{showIcons && <Icon className={iconClassName} />}
						<div>
							<div className="font-medium">{item.label}</div>
							<div className="text-muted-foreground text-xs">
								{item.description}
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
