"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User } from "@/lib/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAvoidRoutes } from "@/hooks/useAvoidRoutes";
import { ChevronDown } from "lucide-react";

interface FigmaNavbarProps {
  className?: string;
  user: User | null;
}

export function FigmaNavbar({ className, user }: FigmaNavbarProps) {
  const { scrollY } = useScroll();
  const [active, setActive] = useState<boolean>(true);
  const isMobile = useIsMobile();
  const shouldAvoid = useAvoidRoutes();

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

  // Logo component
  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 px-7 py-2">
      <svg
        width="62"
        height="63"
        viewBox="0 0 63 63"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <path
          d="M30.3848 49.4033V25.1646L40.5494 15L50.714 25.1646L52.2778 26.7284"
          stroke="#E6E8EE"
          strokeWidth="11.1111"
        />
        <path
          d="M10.0557 49.4033V25.1646L20.2203 15L30.3849 25.1646V49.4033"
          stroke="#E6E8EE"
          strokeWidth="11.1111"
        />
      </svg>
      <span className="text-figma-white font-encode-sans text-xl font-bold">
        SK BUILDERS
      </span>
    </Link>
  );

  // Navigation pills
  const NavigationPills = () => (
    <div className="flex items-center justify-center p-2 bg-white rounded-full">
      <Link
        href="/"
        className="px-6 py-3 bg-black text-white rounded-full border border-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-800"
      >
        Home
      </Link>
      <Link
        href="/search"
        className="px-6 py-3 text-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-100 rounded-full"
      >
        Properties
      </Link>
      <div className="relative group">
        <button className="px-6 py-3 text-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-100 rounded-full flex items-center gap-1">
          Buy
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="relative group">
        <button className="px-6 py-3 text-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-100 rounded-full flex items-center gap-1">
          Sell
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="relative group">
        <button className="px-6 py-3 text-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-100 rounded-full flex items-center gap-1">
          Rent
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Auth buttons
  const AuthButtons = () => (
    <div className="flex items-center p-2 bg-white rounded-full">
      {user ? (
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-figma-dark-green text-white rounded-full text-center font-sofia-pro text-lg font-medium transition-all hover:bg-opacity-80"
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="px-6 py-3 text-black text-center font-sofia-pro text-lg font-medium transition-all hover:bg-gray-100 rounded-full"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-figma-dark-green text-white rounded-full text-center font-sofia-pro text-lg font-medium transition-all hover:bg-opacity-80 ml-2"
          >
            Get started
          </Link>
        </>
      )}
    </div>
  );

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
            {
              hidden: isMobile,
            },
            className
          )}
        >
          <div className="flex justify-between items-center w-full bg-figma-dark-green rounded-2xl p-4 shadow-2xl">
            <Logo />
            <NavigationPills />
            <AuthButtons />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
