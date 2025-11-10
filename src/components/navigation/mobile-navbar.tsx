"use client";

import { Menu, Home, Building2, Landmark, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { User } from "@/lib/types";
import Logo from "../ui/logo";
import {
	NavigationSection,
	type NavigationItem,
} from "./shared/navigation-section";
import { ServicesSection } from "./shared/services-section";
import { ResourcesSection } from "./shared/resources-section";
import { UserSection } from "./shared/user-section";
import { PremiumSection } from "./shared/premium-section";

export type ProfileItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
};

type MobileNavbarProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	role: string | null;
	profileItems: ProfileItem[];
};

const mobileNavigationItems: NavigationItem[] = [
	{ icon: Home, href: "/", label: "Inicio" },
	{ icon: Building2, href: "/search", label: "Buscar Propiedad" },
	{ icon: Landmark, href: "/land", label: "Terrenos" },
	{ icon: Users, href: "/about", label: "Nosotros" },
	{ icon: Mail, href: "/contact", label: "Contacto" },
];

export function MobileNavbar({
	isOpen,
	onOpenChange,
	user,
	role,
	profileItems,
}: MobileNavbarProps) {
	const closeMenu = () => onOpenChange(false);

	return (
		<Sheet onOpenChange={onOpenChange} open={isOpen}>
			<SheetTrigger asChild>
				<Button
					className="h-10 w-10 rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 hover:text-secondary-foreground xl:hidden"
					size="icon"
					variant="ghost"
				>
					<Menu className="h-5 w-5" />
					<span className="sr-only">Abrir menú</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-80 p-0" side="right">
				<SheetHeader className="p-6 pb-4">
					<Logo />
				</SheetHeader>

				<div className="space-y-6 px-6">
					<NavigationSection
						closeMenu={closeMenu}
						isMobile={true}
						items={mobileNavigationItems}
					/>
					<Separator />
					<ServicesSection closeMenu={closeMenu} />
					<Separator />
					<ResourcesSection closeMenu={closeMenu} />
					<Separator />
					<UserSection
						closeMenu={closeMenu}
						isMobile={true}
						profileItems={profileItems}
						role={role}
						user={user}
					/>
					<PremiumSection closeMenu={closeMenu} isMobile={true} />
				</div>
			</SheetContent>
		</Sheet>
	);
}
