"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavSecondaryItem {
	title: string;
	url: string;
	icon?: LucideIcon;
}

interface NavSecondaryProps {
	items: NavSecondaryItem[];
	className?: string;
}

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
