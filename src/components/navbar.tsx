"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAvoidRoutes } from "@/hooks/use-avoid-routes";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/presentation/hooks/use-user";
import {
  Home,
  Building2,
  Landmark,
  Users,
  Mail,
  UserCheck2,
  LogInIcon,
  Settings,
  Shield,
  Menu,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "./ui/logo";
import getProfileItems from "@/lib/navbar/getProfileItems";
import { ModeToggle } from "./mode-toggle";
import LogOutButton from "./auth/logout-button";
import { AuthButtons } from "./auth/auth-buttons";

interface NavbarProps {
  className?: string;
}

const menuItems = [
  { icon: Home, href: "/" },
  { icon: Building2, href: "/search" },
  { icon: Landmark, href: "/land" },
  { icon: Users, href: "/about" },
  { icon: Mail, href: "/contact" },
];

const getMenuLabel = (index: number): string => {
  const labels = [
    "Inicio",
    "Buscar Propiedad",
    "Terrenos",
    "Nosotros",
    "Contacto",
  ];
  return labels[index] || "";
};

export function Navbar({ className }: NavbarProps) {
  const [active, setActive] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const shouldAvoid = useAvoidRoutes();
  const { role, permissions } = useAdmin();
  const { user } = useUser();

  useEffect(() => {
    if (!active) {
      setActive(true);
    }
  }, []);

  if (shouldAvoid) return null;

  // Navigation pills with advanced navigation menu
  const NavigationPills = () => (
    <div className="flex items-center justify-center p-1.5 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border/50">
      {menuItems.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 text-center font-sofia-pro text-sm font-medium transition-all rounded-full whitespace-nowrap",
            i === 0
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-card-foreground hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm"
          )}
        >
          {getMenuLabel(i)}
        </Link>
      ))}

      {/* Menú avanzado 'Más' con NavigationMenu */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="px-3 py-2 text-card-foreground text-center font-sofia-pro text-sm font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground rounded-full flex items-center gap-1 h-auto whitespace-nowrap">
              Más
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-80 p-4 bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                {/* Sección Servicios */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Servicios
                  </h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/services/valuation"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Valuación
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Evaluación profesional
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/services/consulting"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Consultoría
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Asesoría especializada
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/services/legal"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Legal
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Trámites legales
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>

                {/* Sección Recursos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Recursos
                  </h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/blog"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Blog
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Artículos y noticias
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/guides"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Guías
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Guías de compra/venta
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/calculator"
                        className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                      >
                        <div className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          Calculadora
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Calculadora hipotecaria
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
              </div>

              {/* Sección destacada */}
              <div className="mt-4 pt-4 border-t border-border">
                <NavigationMenuLink asChild>
                  <Link
                    href="/premium"
                    className="flex items-center p-3 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 hover:from-accent/30 hover:to-primary/30 transition-all border border-accent/20"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                        Servicios Premium
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Acceso exclusivo a herramientas avanzadas
                      </div>
                    </div>
                    <div className="ml-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full whitespace-nowrap">
                      Nuevo
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );

  // Mobile Navigation Component
  const MobileNavigation = () => {
    const profileItems = user && role ? getProfileItems(role, permissions) : [];

    return (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border/50 hover:bg-secondary/80 hover:text-secondary-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <Logo />
              <ModeToggle />
            </div>
          </SheetHeader>

          <div className="px-6 space-y-6">
            {/* Navigation Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Navegación
              </h3>
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{getMenuLabel(i)}</span>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* Services Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Servicios
              </h3>
              <Link
                href="/services/valuation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Valuación</div>
                  <div className="text-xs text-muted-foreground">
                    Evaluación profesional
                  </div>
                </div>
              </Link>
              <Link
                href="/services/consulting"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Consultoría</div>
                  <div className="text-xs text-muted-foreground">
                    Asesoría especializada
                  </div>
                </div>
              </Link>
              <Link
                href="/services/legal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Legal</div>
                  <div className="text-xs text-muted-foreground">
                    Trámites legales
                  </div>
                </div>
              </Link>
            </div>

            <Separator />

            {/* Resources Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recursos
              </h3>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Blog</span>
              </Link>
              <Link
                href="/guides"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Guías</span>
              </Link>
              <Link
                href="/calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Landmark className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Calculadora</span>
              </Link>
            </div>

            <Separator />

            {/* User Section */}
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="font-medium text-sm truncate">
                    {user.getProfile().getFullName() || user.getEmail().value}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {role === "admin"
                      ? "Administrador"
                      : role === "agent"
                      ? "Agente"
                      : "Usuario"}
                  </div>
                </div>

                {profileItems.map(({ icon: Icon, href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}

                <LogOutButton user={null} />
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
                >
                  <LogInIcon className="h-4 w-4" />
                  <span className="font-medium">Iniciar Sesión</span>
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <UserCheck2 className="h-4 w-4" />
                  <span className="font-medium">Registrarse</span>
                </Link>
              </div>
            )}

            {/* Premium Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/20">
              <Link
                href="/premium"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-card-foreground">
                      Servicios Premium
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Herramientas avanzadas
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                    Nuevo
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{
            ease: "linear",
          }}
          className={cn(
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "w-full max-w-7xl px-4",
            className
          )}
        >
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center w-full bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50">
            <Logo />
            <NavigationPills />
            <AuthButtons />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between items-center w-full bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50">
            <Logo />
            <div className="flex items-center gap-2">
              <ModeToggle />
              <MobileNavigation />
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
