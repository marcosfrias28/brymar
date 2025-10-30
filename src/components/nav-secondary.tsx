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

type NavSecondaryItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
};

type NavSecondaryProps = {
	items: NavSecondaryItem[];
	className?: string;
};

export function NavSecondary({ items, className }: NavSecondaryProps) {
	const pathname = usePathname();

	return (
		<SidebarGroup className={className}>
			<SidebarGroupLabel>Más</SidebarGroupLabel>
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
