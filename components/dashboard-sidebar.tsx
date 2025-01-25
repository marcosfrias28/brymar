"use client";

import { Home, Landmark, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";

export function DashboardSidebar() {
  const pathname = usePathname();
  const language = useLangStore((prev) => prev.language);
  const t = translations[language].dashboard;

  const menuItems = [
    { title: t.properties, icon: Home, href: "/dashboard/properties" },
    { title: t.lands, icon: Landmark, href: "/dashboard/lands" },
    { title: t.blog, icon: FileText, href: "/dashboard/blog" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
