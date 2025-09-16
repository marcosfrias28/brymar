"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User } from "@/lib/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAvoidRoutes } from "@/hooks/useAvoidRoutes";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Home,
  Building2,
  Landmark,
  Users,
  Mail,
  UserCheck2,
  LogInIcon,
  LogOutIcon,
  ChevronDown,
  Settings,
  User as UserIcon,
  Shield,
  Menu,
  X,
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
import { CustomButton } from "./custom-buttom";
import { ModeToggle } from "./mode-toggle";
import Logo from "./ui/logo";

interface NavbarProps {
  className?: string;
  user: User | null;
}

// Función para obtener elementos del menú basados en el rol del usuario
const getProfileItems = (userRole: string, permissions: any) => {
  const items = [];
  
  // Elementos comunes para usuarios autenticados
  if (permissions?.canAccessDashboard) {
    items.push({ icon: UserIcon, href: "/dashboard/properties", label: "Mi Perfil" });
  }
  
  // Elementos específicos por rol
  if (userRole === 'admin') {
    items.push(
      { icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
      { icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
      { icon: Mail, href: "/dashboard/blog", label: "Blog" },
      { icon: Users, href: "/dashboard/users", label: "Usuarios" },
      { icon: Settings, href: "/dashboard/settings", label: "Configuración" }
    );
  } else if (userRole === 'agent') {
    items.push(
      { icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
      { icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
      { icon: Settings, href: "/dashboard/settings", label: "Configuración" }
    );
  }
  
  return items;
};

const menuItems = [
  { icon: Home, href: "/" },
  { icon: Building2, href: "/search-property" },
  { icon: Landmark, href: "/land" },
  { icon: Users, href: "/about" },
  { icon: Mail, href: "/contact" },
];

const getMenuLabel = (index: number): string => {
  const labels = ["Inicio", "Buscar Propiedad", "Terrenos", "Nosotros", "Contacto"];
  return labels[index] || "";
};

export function Navbar({ className, user }: NavbarProps) {
  const { scrollY } = useScroll();
  const [active, setActive] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const shouldAvoid = useAvoidRoutes();
  const { permissions, userRole, canAccessDashboard } = usePermissions();

  useEffect(() => {
    const handleScroll = () => {
      const prev = scrollY.getPrevious();
      const curr = scrollY.get();
      if (prev! > curr) setActive(true);
      else {
        if (active) setActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [active, scrollY]);

  if (shouldAvoid) return null;

  // Navigation pills with advanced navigation menu
  const NavigationPills = () => (
    <div className="flex items-center justify-center p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
      {menuItems.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-2 py-1.5 text-center font-sofia-pro text-sm font-medium transition-all rounded-full whitespace-nowrap",
            i === 0
              ? "bg-foreground text-background border border-foreground hover:bg-foreground/90 shadow-sm"
        : "text-foreground hover:bg-muted hover:shadow-sm"
          )}
        >
          {getMenuLabel(i)}
        </Link>
      ))}
      
      {/* Menú avanzado 'Más' con NavigationMenu */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="px-4 py-1.5 text-foreground text-center font-sofia-pro text-sm font-medium transition-all hover:bg-muted rounded-full flex items-center gap-1 h-auto whitespace-nowrap">
              Más
              <ChevronDown className="w-4 h-4" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-80 p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Sección Servicios */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground whitespace-nowrap">Servicios</h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link href="/services/valuation" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Valuación</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Evaluación profesional</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/services/consulting" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Consultoría</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Asesoría especializada</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/services/legal" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Legal</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Trámites legales</div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
                
                {/* Sección Recursos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground whitespace-nowrap">Recursos</h4>
                  <div className="space-y-2">
                    <NavigationMenuLink asChild>
                      <Link href="/blog" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Blog</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Artículos y noticias</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/guides" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Guías</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Guías de compra/venta</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/calculator" className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="text-sm font-medium text-foreground whitespace-nowrap">Calculadora</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Calculadora hipotecaria</div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
              </div>
              
              {/* Sección destacada */}
              <div className="mt-4 pt-4 border-t border-border">
                <NavigationMenuLink asChild>
                  <Link href="/premium" className="flex items-center p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 transition-all">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground whitespace-nowrap">Servicios Premium</div>
                       <div className="text-xs text-muted-foreground whitespace-nowrap">Acceso exclusivo a herramientas avanzadas</div>
                     </div>
                     <div className="ml-2 px-2 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full whitespace-nowrap">
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

  // Auth buttons with profile functionality
  const AuthButtons = () => {
    const profileItems = user && userRole ? getProfileItems(userRole, permissions) : [];
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
          {user ? (
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-4 py-1.5 text-foreground rounded-full text-center font-sofia-pro text-sm font-medium transition-all hover:bg-muted hover:shadow-sm flex items-center gap-2 h-auto whitespace-nowrap">
                    {userRole === 'user' ? (
                      <>
                        <UserIcon className="w-4 h-4" />
                        Perfil
                      </>
                    ) : (
                      <>
                        <UserCheck2 className="w-4 h-4" />
                        Dashboard
                      </>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-64 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                    {/* Información del usuario */}
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border/50 bg-muted/50">
                      <div className="font-medium text-foreground whitespace-nowrap truncate">{user.name || user.email}</div>
                      <div className="text-xs capitalize whitespace-nowrap">
                        {userRole === 'admin' ? 'Administrador' : 
                         userRole === 'agent' ? 'Agente' : 'Usuario'}
                      </div>
                    </div>
                    
                    {/* Elementos del menú basados en rol */}
                    {profileItems.map(({ icon: Icon, href, label }) => (
                      <NavigationMenuLink key={href} asChild>
                        <Link href={href} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/80 transition-colors rounded-sm whitespace-nowrap">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{label}</span>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                    
                    {profileItems.length > 0 && <div className="border-t border-border/50 my-1" />}
                    
                    {/* Cerrar sesión */}
                    <NavigationMenuLink asChild>
                      <Link href="/sign-out" className="flex items-center gap-2 text-destructive px-3 py-2 hover:bg-destructive/10 transition-colors rounded-sm whitespace-nowrap">
                        <LogOutIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Cerrar Sesión</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-1.5 text-foreground text-center font-sofia-pro text-sm font-medium transition-all hover:bg-muted hover:shadow-sm rounded-full whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-center font-sofia-pro text-sm font-medium transition-all hover:bg-primary/90 hover:shadow-sm ml-2 whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>
        <ModeToggle />
      </div>
    );
  };

  // Mobile Navigation Component
  const MobileNavigation = () => {
    const profileItems = user && userRole ? getProfileItems(userRole, permissions) : [];
    
    return (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white/80"
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navegación</h3>
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Servicios</h3>
              <Link href="/services/valuation" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Valuación</div>
                  <div className="text-xs text-muted-foreground">Evaluación profesional</div>
                </div>
              </Link>
              <Link href="/services/consulting" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Consultoría</div>
                  <div className="text-xs text-muted-foreground">Asesoría especializada</div>
                </div>
              </Link>
              <Link href="/services/legal" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Legal</div>
                  <div className="text-xs text-muted-foreground">Trámites legales</div>
                </div>
              </Link>
            </div>
            
            <Separator />
            
            {/* Resources Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recursos</h3>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Blog</span>
              </Link>
              <Link href="/guides" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Guías</span>
              </Link>
              <Link href="/calculator" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Landmark className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Calculadora</span>
              </Link>
            </div>
            
            <Separator />
            
            {/* User Section */}
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="font-medium text-sm truncate">{user.name || user.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {userRole === 'admin' ? 'Administrador' : 
                     userRole === 'agent' ? 'Agente' : 'Usuario'}
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
                
                <Link
                  href="/sign-out"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <LogOutIcon className="h-5 w-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <LogInIcon className="h-4 w-4" />
                  <span className="font-medium">Iniciar Sesión</span>
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <UserCheck2 className="h-4 w-4" />
                  <span className="font-medium">Registrarse</span>
                </Link>
              </div>
            )}
            
            {/* Premium Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-border/50">
              <Link href="/premium" onClick={() => setMobileMenuOpen(false)} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Servicios Premium</div>
                    <div className="text-xs text-muted-foreground">Herramientas avanzadas</div>
                  </div>
                  <div className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full">
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
          <div className="hidden md:flex justify-between items-center w-full bg-primary dark:bg-accent backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-primary/20">
            <Logo />
            <NavigationPills />
            <AuthButtons />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between items-center w-full bg-primary dark:bg-accent backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-primary/20">
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
