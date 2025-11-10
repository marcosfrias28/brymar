"use client";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ServicesSection } from "./services-section";
import { ResourcesSection } from "./resources-section";
import { PremiumSection } from "./premium-section";

export function DesktopNavigationMenu() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger className="flex h-auto items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-center font-medium font-sofia-pro text-foreground text-sm transition-all">
						Más
					</NavigationMenuTrigger>
					<NavigationMenuContent className="border border-white/20 p-4 shadow-xl backdrop-blur-xl">
						<div className="grid w-full max-w-2xl grid-cols-2 gap-4">
							<ServicesSection
								iconClassName="hidden"
								linkClassName="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
							/>
							<ResourcesSection
								iconClassName="hidden"
								linkClassName="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
							/>
						</div>
						<PremiumSection linkClassName="flex items-center rounded-lg border border-accent/20 bg-gradient-to-r from-accent/20 to-primary/20 p-3 transition-all hover:from-accent/30 hover:to-primary/30" />
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
