"use client";

import { use, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import {
  Home,
  Building2,
  Landmark,
  Users,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
  Globe2,
  SidebarCloseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { m, motion } from "framer-motion";
import exp from "constants";

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Building2, label: "Properties", href: "/properties" },
  { icon: Landmark, label: "Land", href: "/land" },
  { icon: Users, label: "About Us", href: "/about" },
  { icon: Mail, label: "Contact", href: "/contact" },
];

export function Sidebar({ className }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const languages = {
    en: "English",
    es: "Español",
    it: "Italiano",
  };

  return (
    <aside
      className={cn(
        "fixed left-0 max-md:scale-[.65] max-md:-left-4 opacity-65 hover:opacity-100 top-1/2 -translate-y-1/2 z-50 h-fit rounded-tr-3xl rounded-br-3xl border-r border-border transition-all duration-300 ",
        "bg-white dark:bg-black text-black dark:text-white",
        expanded ? "w-48  max-md:-left-6" : "w-16",
        className
      )}
    >
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-2 right-2 z-50 h-8 w-8 rounded-full bg-background p-1 text-xl text-gray-600 hover:bg-gray-100 transition-all duration-300"
        >
          <SidebarCloseIcon />
        </button>
      )}

      <nav
        onMouseEnter={() => setExpanded(true)}
        className={cn("flex flex-col z-50", expanded ? "w-48" : "w-16")}
      >
        <div className="flex-1 px-2 mt-10">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start mb-2",
                expanded ? "px-4" : "px-0 py-2"
              )}
              asChild
            >
              <a
                href={expanded ? item.href : undefined}
                className="flex items-center gap-4"
              >
                <item.icon
                  className={cn("h-5 w-5", expanded ? "ml-0" : "ml-4")}
                />
                {expanded && (
                  <motion.p
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-balance"
                  >
                    {item.label}
                  </motion.p>
                )}
              </a>
            </Button>
          ))}
          <section className=" mt-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-full justify-start mb-2",
                    "flex items-center gap-4",
                    expanded ? "px-4" : "px-0 py-2"
                  )}
                >
                  <Globe2
                    className={cn("h-5 w-5", expanded ? "ml-0" : "ml-4")}
                  />
                  {expanded && (
                    <motion.p
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-balance"
                    >
                      {languages[language as keyof typeof languages]}
                    </motion.p>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(languages).map(([code, name]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => {
                      setLanguage(code as "en" | "es" | "it");
                      setExpanded(false);
                    }}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full justify-start mb-2",
                "flex items-center gap-4",
                expanded ? "px-4" : "px-0 py-2"
              )}
            >
              <Sun
                className={cn(
                  "dark:block hidden",
                  "h-5 w-5",
                  expanded ? "ml-0" : "ml-4"
                )}
              />
              <Moon
                className={cn(
                  "dark:hidden block h-5 w-5",
                  expanded ? "ml-0" : "ml-4"
                )}
              />
              {expanded && (
                <motion.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-balance"
                >
                  Theme
                </motion.p>
              )}
            </Button>
          </section>
        </div>
      </nav>
    </aside>
  );
}
