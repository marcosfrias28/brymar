'use client'

import { Building2, Home, Landmark, Mail, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { PillContainer, PillLink } from '@/components/ui/pill-container'

const menuItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  {
    href: '/search?type=properties',
    icon: Building2,
    label: 'Propiedades',
  },
  { href: '/search?type=lands', icon: Landmark, label: 'Terrenos' },
  { href: '/about', icon: Users, label: 'Nosotros' },
  { href: '/contact', icon: Mail, label: 'Contacto' },
]

export function NavigationPills() {
  const pathname = usePathname()

  return (
    <PillContainer>
      {menuItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

        return (
          <Link href={item.href} key={item.href}>
            <PillLink isActive={isActive}>{item.label}</PillLink>
          </Link>
        )
      })}

      {/* Menú avanzado 'Más' con NavigationMenu */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex h-auto items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-center font-medium font-sofia-pro text-foreground text-sm transition-all">
              Más
            </NavigationMenuTrigger>
            <NavigationMenuContent className="border border-white/20 p-4 shadow-xl backdrop-blur-xl">
              <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
                {/* Sección Servicios */}
                <div className="space-y-3">
                  <h4 className="whitespace-nowrap font-semibold text-card-foreground text-sm">Servicios</h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/services/valuation"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Valuación</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Evaluación profesional</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/services/consulting"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Consultoría</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Asesoría especializada</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/services/legal"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Legal</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Trámites legales</div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>

                {/* Sección Recursos */}
                <div className="space-y-3">
                  <h4 className="whitespace-nowrap font-semibold text-card-foreground text-sm">Recursos</h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/blog"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Blog</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Artículos y noticias</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/guides"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Guías</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Guías de compra/venta</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        className="block rounded-md p-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
                        href="/calculator"
                      >
                        <div className="whitespace-nowrap font-medium text-card-foreground text-sm">Calculadora</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">Calculadora hipotecaria</div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
              </div>

              {/* Sección destacada */}
              <div className="mt-4 border-border border-t pt-4">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex items-center rounded-lg border border-accent/20 bg-gradient-to-r from-accent/20 to-primary/20 p-3 transition-all hover:from-accent/30 hover:to-primary/30"
                    href="/premium"
                  >
                    <div className="flex-1">
                      <div className="whitespace-nowrap font-semibold text-card-foreground text-sm">
                        Servicios Premium
                      </div>
                      <div className="whitespace-nowrap text-muted-foreground text-xs">
                        Acceso exclusivo a herramientas avanzadas
                      </div>
                    </div>
                    <div className="ml-2 whitespace-nowrap rounded-full bg-accent px-2 py-1 font-medium text-accent-foreground text-xs">
                      Nuevo
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </PillContainer>
  )
}
