"use client";

import { Building2, Home, Landmark, Mail, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PillContainer, PillLink } from "@/components/ui/pill-container";

export type NavigationItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
};

type NavigationSectionProps = {
	items: NavigationItem[];
	className?: string;
	iconClassName?: string;
	showIcons?: boolean;
	closeMenu?: () => void;
	isMobile?: boolean;
};

const navigationItems: NavigationItem[] = [
	{ icon: Home, href: "/", label: "Inicio" },
	{ icon: Building2, href: "/search", label: "Buscar Propiedad" },
	{ icon: Landmark, href: "/land", label: "Terrenos" },
	{ icon: Users, href: "/about", label: "Nosotros" },
	{ icon: Mail, href: "/contact", label: "Contacto" },
];

export function NavigationSection({
	items = navigationItems,
	className,
	iconClassName = "h-5 w-5 text-muted-foreground",
	showIcons = true,
	closeMenu,
}: NavigationSectionProps) {
	const pathname = usePathname();

	const handleClick = () => {
		if (closeMenu) {
			closeMenu();
		}
	};

	return (
		<PillContainer className={cn(className)}>
			{items.map((item) => {
				const Icon = item.icon;
				const isActive =
					pathname === item.href ||
					(item.href !== "/" && pathname.startsWith(item.href));

				return (
					<PillLink key={item.href}>
						<Link
							className={cn(
								"flex items-center gap-3 rounded-lg transition-colors hover:bg-muted/50",
								isActive && "bg-secondary text-foreground"
							)}
							href={item.href}
							onClick={handleClick}
						>
							{showIcons && <Icon className={iconClassName} />}
							<span className="font-medium">{item.label}</span>
						</Link>
					</PillLink>
				);
			})}
		</PillContainer>
	);
}
