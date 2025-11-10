"use client";

import { Building2, Home, Landmark, Mail, Users } from "lucide-react";
import { PillContainer } from "@/components/ui/pill-container";
import {
	NavigationSection,
	type NavigationItem,
} from "./shared/navigation-section";
import { DesktopNavigationMenu } from "./shared/desktop-navigation-menu";

const navigationItems: NavigationItem[] = [
	{ href: "/", icon: Home, label: "Inicio" },
	{
		href: "/search?type=properties",
		icon: Building2,
		label: "Propiedades",
	},
	{ href: "/search?type=lands", icon: Landmark, label: "Terrenos" },
	{ href: "/about", icon: Users, label: "Nosotros" },
	{ href: "/contact", icon: Mail, label: "Contacto" },
];

export function NavigationPills() {
	return (
		<PillContainer>
			<NavigationSection
				isMobile={false}
				items={navigationItems}
				showIcons={true}
			/>
			<DesktopNavigationMenu />
		</PillContainer>
	);
}
