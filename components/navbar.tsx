"use client";

import { useEffect, useState } from "react";

import {
  Home,
  Building2,
  Landmark,
  Users,
  Mail,
  UserCheck2,
  LogInIcon,
  LogOutIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CustomButton } from "./custom-buttom";
import { ModeToggle } from "./mode-toggle";
import { User } from "@/lib/db/schema";
import { Button } from "./ui/button";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useAvoidRoutes } from "@/hooks/useAvoidRoutes";
import { useIsMobile } from "@/hooks/use-mobile";

interface SideBarProps {
  className?: string;
  user: User | null;
}

const profileItems = [
  { icon: UserCheck2, href: "/dashboard/properties" },
  { icon: LogInIcon, href: "/sign-in" },
  { icon: LogOutIcon, href: "/sign-up" },
  { icon: Mail, href: "/dashboard/properties" },
];

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

export function Navbar({ className, user }: SideBarProps) {

  // Scroll
  const { scrollY } = useScroll();
  const [active, setActive] = useState<boolean>(true);
  const isMobile = useIsMobile();
  
  const shouldAvoid = useAvoidRoutes();
  
  useEffect(() => {
    window.addEventListener("scroll", () => {
      const prev = scrollY.getPrevious();
      const curr = scrollY.get();
      if (prev! > curr) setActive(true);
      else {
        if (active) setActive(false);
      }
    });

    return () => window.removeEventListener("scroll", () => {});
  }, [active, scrollY]);

  if (shouldAvoid) return null;



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
            // Posizione e layout
            "fixed inset-0 z-50 p-4 mx-auto mt-8",
            // Stili di dimensioni e forma
            "w-screen max-w-(--breakpoint-2xl) h-fit rounded-xl shadow-xl shadow-black/50",
            // Stili visivi generali
            "bg-background text-foreground",
            // Stili per transizioni e animazioni
            "transition-all duration-300",
            // RResponsive layout
            {
              hidden: isMobile,
            },
            // Classi aggiuntive passate come props
            className
          )}
        >
          <div className="flex justify-between flex-row max-lg:flex-col max-lg:items-center w-full mx-auto">
            <div className="flex flex-row max-lg:flex-col items-center max-lg:gap-0 gap-2 justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton className="w-fit" icon={UserCheck2}>
                    Perfil
                  </CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="flex outline-hidden">
                    {profileItems.map(({ icon, href }) => (
                      <Link
                        key={Math.random()}
                        href={href}

                      >
                        <CustomButton
                          icon={icon}
                          label="Panel"
                          className="w-fit"
                        />
                      </Link>
                    ))}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-row max-lg:flex-col max-lg:gap-0 gap-2 justify-center items-center">
              {menuItems.map((item, i) => (
                <Link key={Math.random()} href={item.href}>
                  <CustomButton icon={item.icon} label={getMenuLabel(i)} />
                </Link>
              ))}
            </div>
            <section className="flex flex-row items-center max-lg:gap-0 gap-2 lg:justify-end">

              <ModeToggle />
            </section>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
