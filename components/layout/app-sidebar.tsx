"use client"

import { Home, Building2, MapPin, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
]

const getMenuTitle = (title: string) => {
  const titles: Record<string, string> = {
    dashboard: "Panel de Control",
    properties: "Propiedades",
    lands: "Terrenos",
    blog: "Blog",
    settings: "Configuración"
  };
  return titles[title] || title;
};

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-arsenic border-r border-blackCoral">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-aurora rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-azureishWhite font-italianno">Marbry</h2>
            <p className="text-sm text-darkVanilla">Inmobiliaria</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-darkVanilla">Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-azureishWhite hover:bg-blackCoral hover:text-white data-[active=true]:bg-aurora data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
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
  )
}
