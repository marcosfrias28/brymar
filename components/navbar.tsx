"use client";

import { useEffect, useRef, useState } from "react";

import {
  LucideLogIn,
  Languages,
  Home,
  Building2,
  Landmark,
  Users,
  Mail,
  LayoutDashboard,
  UserCheck2,
  Sun,
  Moon,
  Shield,
  User as UserIcon,
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
import { useLangStore } from "@/utils/store/lang-store";
import { ModeToggle } from "./mode-toggle";
import { SideBarTranslations as translations } from "@/lib/translations";
import LogOutButton from "@/app/(auth)/logout-button";
import { User } from "@/lib/db/schema";
import { Button } from "./ui/button";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useTheme } from "next-themes";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface SideBarProps {
  className?: string;
  user: User | null;
}

const profileItems = [
  { icon: UserCheck2, href: "/dashboard/properties" },
  { icon: LogInIcon, href: "/sign-in" },
  { icon: LogOutIcon, href: "/sign-out" },
  { icon: Mail, href: "/dashboard/properties" },
];

const menuItems = [
  { icon: Home, href: "/" },
  { icon: Building2, href: "/search-property" },
  { icon: Landmark, href: "/land" },
  { icon: Users, href: "/about" },
  { icon: Mail, href: "/contact" },
];

export function Navbar({ className, user }: SideBarProps) {
  const language = useLangStore((prev) => prev.language);
  const setLanguage = useLangStore((prev) => prev.setLanguage);
  const currentTranslations = translations[language];
  const { scrollY } = useScroll();
  const [active, setActive] = useState<boolean>(true);
  const isMobile = useIsMobile();

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
  }, []);

  const handleChangeLanguage = (code: "en" | "es" | "it") => {
    setLanguage(code);
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
            // Posizione e layout
            "fixed inset-0 z-50 p-4 mx-auto mt-4",
            // Stili di dimensioni e forma
            "w-screen max-w-screen-2xl h-fit rounded-xl shadow-xl shadow-black/50",
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
                    Profilo
                  </CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="flex outline-none">
                    {profileItems.map(({ icon, href }) => (
                      <Link
                        key={Math.random()}
                        href={href}
                        onClick={() => handleChangeLanguage("en")}
                      >
                        <CustomButton
                          icon={icon}
                          label="Dashboard"
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
                  <CustomButton
                    icon={item.icon}
                    label={currentTranslations.menuLabels[i]}
                  />
                </Link>
              ))}
            </div>
            <section className="flex flex-row items-center max-lg:gap-0 gap-2 lg:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton
                    className="w-fit"
                    icon={Languages}
                    label={language}
                  >
                    {Object.entries(translations).map(([code, t]) => (
                      <Button
                        key={Math.random()}
                        variant="ghost"
                        onClick={() =>
                          handleChangeLanguage(code as "en" | "es" | "it")
                        }
                      >
                        {t.buttons.languages}
                      </Button>
                    ))}
                  </CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex">
                  {Object.entries(translations).map(([code, t]) => (
                    <DropdownMenuItem
                      key={Math.random()}
                      className="flex outline-none"
                    >
                      <Button
                        key={Math.random()}
                        variant="ghost"
                        onClick={() =>
                          handleChangeLanguage(code as "en" | "es" | "it")
                        }
                      >
                        {t.buttons.languages}
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <ModeToggle />
            </section>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
