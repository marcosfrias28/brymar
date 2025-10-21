"use client";

import Link from "next/link";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Logo from "../ui/logo";
import { ModeToggle } from "../mode-toggle";
import LogOutButton from "../auth/logout-button";
import { User } from "@/lib/types";

interface ProfileItem {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

interface MobileNavbarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  role: string | null;
  profileItems: ProfileItem[];
}

const menuItems = [
  { icon: Home, href: "/", label: "Inicio" },
  { icon: Building2, href: "/search", label: "Buscar Propiedad" },
  { icon: Landmark, href: "/land", label: "Terrenos" },
  { icon: Users, href: "/about", label: "Nosotros" },
  { icon: Mail, href: "/contact", label: "Contacto" },
];

export function MobileNavbar({
  isOpen,
  onOpenChange,
  user,
  role,
  profileItems,
}: MobileNavbarProps) {
  const closeMenu = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full bg-white/10 backdrop-blur-xl shadow-lg border border-white/20 hover:bg-white/20 hover:text-secondary-foreground transition-all h-10 w-10"
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
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Blog</span>
            </Link>
            <Link
              href="/guides"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Guías</span>
            </Link>
            <Link
              href="/calculator"
              onClick={closeMenu}
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
                  {user.name ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.email}
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
                  onClick={closeMenu}
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
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
              >
                <LogInIcon className="h-4 w-4" />
                <span className="font-medium">Iniciar Sesión</span>
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                <UserCheck2 className="h-4 w-4" />
                <span className="font-medium">Registrarse</span>
              </Link>
            </div>
          )}

          {/* Premium Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/20">
            <Link href="/premium" onClick={closeMenu} className="block">
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
}
