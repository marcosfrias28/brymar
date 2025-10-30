"use client";

import { Building2, FileText, Home, MapPin, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
	{
		title: "dashboard",
		url: "/dashboard",
		icon: Home,
	},
	{
		title: "properties",
		url: "/dashboard/properties",
		icon: Building2,
	},
	{
		title: "lands",
		url: "/dashboard/lands",
		icon: MapPin,
	},
	{
		title: "blog",
		url: "/dashboard/blog",
		icon: FileText,
	},

	{
		title: "settings",
		url: "/dashboard/settings",
		icon: Settings,
	},
];

const getMenuTitle = (title: string) => {
	const titles: Record<string, string> = {
		dashboard: "Panel de Control",
		properties: "Propiedades",
		lands: "Terrenos",
		blog: "Blog",

		settings: "Configuración",
	};
	return titles[title] || title;
};

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar className="border-blackCoral border-r bg-arsenic">
			<SidebarHeader className="p-6">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora">
						<Building2 className="h-5 w-5 text-white" />
					</div>
					<div>
						<h2 className="font-bold font-italianno text-azureishWhite text-lg">
							Marbry
						</h2>
						<p className="text-darkVanilla text-sm">Inmobiliaria</p>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-darkVanilla">
						Navegación Principal
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="text-azureishWhite hover:bg-blackCoral hover:text-white data-[active=true]:bg-aurora data-[active=true]:text-white"
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{getMenuTitle(item.title)}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4">
				{/* Language selector removed - Spanish only */}
			</SidebarFooter>
		</Sidebar>
	);
}
