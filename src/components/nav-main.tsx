"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: NavItem[];
};

type NavMainProps = {
	items: NavItem[];
};

export function NavMain({ items }: NavMainProps) {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive = pathname === item.url;
					return (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={isActive}>
								<Link href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
