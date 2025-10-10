"use client";

import Link from "next/link";
import { UserCheck2, LogInIcon, User as UserIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import LogOutButton from "@/components/auth/logout-button";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import getProfileItems from "@/lib/navbar/getProfileItems";

interface AuthButtonsProps {
  className?: string;
  showModeToggle?: boolean;
  variant?: "default" | "compact" | "minimal";
}

export function AuthButtons({
  className = "",
  showModeToggle = true,
  variant = "default",
}: AuthButtonsProps) {
  const { role, permissions } = useAdmin();
  const { user } = useUser();
  const profileItems = user && role ? getProfileItems(role, permissions) : [];

  // Variant styles
  const getContainerStyles = () => {
    switch (variant) {
      case "compact":
        return "flex items-center p-1 bg-card/90 backdrop-blur-sm rounded-lg shadow-md border border-border/30";
      case "minimal":
        return "flex items-center gap-1";
      default:
        return "flex items-center p-1.5 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border/50";
    }
  };

  const getTriggerStyles = () => {
    switch (variant) {
      case "compact":
        return "px-2 py-1 text-card-foreground rounded-md text-center font-sofia-pro text-xs font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm flex items-center gap-1 h-auto whitespace-nowrap";
      case "minimal":
        return "px-2 py-1 text-card-foreground text-center font-sofia-pro text-xs font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground rounded-md flex items-center gap-1 h-auto whitespace-nowrap";
      default:
        return "px-3 py-2 text-card-foreground rounded-full text-center font-sofia-pro text-sm font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm flex items-center gap-2 h-auto whitespace-nowrap";
    }
  };

  const getLinkStyles = () => {
    switch (variant) {
      case "compact":
        return "px-2 py-1 text-card-foreground text-center font-sofia-pro text-xs font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm rounded-md whitespace-nowrap";
      case "minimal":
        return "px-2 py-1 text-card-foreground text-center font-sofia-pro text-xs font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground rounded-md whitespace-nowrap";
      default:
        return "px-3 py-2 text-card-foreground text-center font-sofia-pro text-sm font-medium transition-all hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm rounded-full whitespace-nowrap";
    }
  };

  const getSignUpStyles = () => {
    switch (variant) {
      case "compact":
        return "px-2 py-1 bg-accent text-accent-foreground rounded-md text-center font-sofia-pro text-xs font-medium transition-all hover:bg-accent/90 hover:shadow-sm whitespace-nowrap";
      case "minimal":
        return "px-2 py-1 bg-accent text-accent-foreground rounded-md text-center font-sofia-pro text-xs font-medium transition-all hover:bg-accent/90 whitespace-nowrap";
      default:
        return "px-3 py-2 bg-accent text-accent-foreground rounded-full text-center font-sofia-pro text-sm font-medium transition-all hover:bg-accent/90 hover:shadow-sm whitespace-nowrap";
    }
  };

  const getIconSize = () => {
    return variant === "compact" || variant === "minimal"
      ? "h-3 w-3"
      : "h-4 w-4";
  };

  const getContentWidth = () => {
    switch (variant) {
      case "compact":
        return "w-64 sm:w-80";
      case "minimal":
        return "w-60 sm:w-72";
      default:
        return "w-80 sm:w-96";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={getContainerStyles()}>
        {user ? (
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={getTriggerStyles()}>
                  {role === "user" ? (
                    <>
                      <UserIcon className={getIconSize()} />
                      <span className="hidden sm:inline">
                        {variant === "compact" ? "Perfil" : "Perfil"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCheck2 className={getIconSize()} />
                      <span className="hidden lg:inline">
                        {variant === "compact" ? "Panel" : "Dashboard"}
                      </span>
                    </>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={`bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl ${getContentWidth()}`}
                >
                  {/* Información del usuario */}
                  <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border/50">
                    <Link href={role === "admin" ? "/dashboard" : "/profile"}>
                      <div className="font-medium text-card-foreground whitespace-nowrap truncate">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs capitalize whitespace-nowrap">
                        {role === "admin"
                          ? "Administrador"
                          : role === "agent"
                          ? "Agente"
                          : "Usuario"}
                      </div>
                    </Link>
                  </div>

                  {/* Elementos del menú basados en rol */}
                  {profileItems.map(({ icon: Icon, href, label }) => (
                    <NavigationMenuLink key={href} asChild>
                      <Link href={href}>
                        <div className="flex items-center flex-nowrap gap-2 px-3 py-2 hover:bg-secondary/60 hover:text-secondary-foreground transition-colors rounded-sm whitespace-nowrap">
                          <Icon className={getIconSize()} />
                          <span className="truncate">{label}</span>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}

                  {profileItems.length > 0 && (
                    <div className="border-t border-border/50 my-1" />
                  )}

                  {/* Cerrar sesión */}
                  <NavigationMenuLink asChild>
                    <LogOutButton user={user} />
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <div className="flex items-center gap-1">
            <Link href="/sign-in" className={getLinkStyles()}>
              <span className="hidden sm:inline">
                {variant === "compact" ? "Login" : "Login"}
              </span>
              <LogInIcon className={`${getIconSize()} sm:hidden`} />
            </Link>
            <Link href="/sign-up" className={getSignUpStyles()}>
              <span className="hidden sm:inline">
                {variant === "compact" ? "Registro" : "Get started"}
              </span>
              <UserCheck2 className={`${getIconSize()} sm:hidden`} />
            </Link>
          </div>
        )}
      </div>
      {showModeToggle && <ModeToggle />}
    </div>
  );
}
