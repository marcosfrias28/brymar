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

type NavDocument = {
	name: string;
	url: string;
	icon?: LucideIcon;
};

type NavDocumentsProps = {
	items: NavDocument[];
};

export function NavDocuments({ items }: NavDocumentsProps) {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Documentos</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive = pathname === item.url;
					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild isActive={isActive}>
								<Link href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.name}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
