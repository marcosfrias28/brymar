"use client"

import { Home, Building2, MapPin, FileText, Settings, Languages } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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

export function AppSidebar() {
  const { language, setLanguage } = useLangStore()
  const t = translations[language]
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
                      <span>{t[item.title as keyof typeof t]}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-azureishWhite hover:bg-blackCoral">
              <Languages className="w-4 h-4 mr-2" />
              {language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-arsenic border-blackCoral">
            <DropdownMenuItem onClick={() => setLanguage("es")} className="text-azureishWhite hover:bg-blackCoral">
              Español
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")} className="text-azureishWhite hover:bg-blackCoral">
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("it")} className="text-azureishWhite hover:bg-blackCoral">
              Italiano
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
