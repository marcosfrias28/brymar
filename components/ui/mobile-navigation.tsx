"use client";

import * as React from "react";
import {
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useResponsive } from "@/hooks/use-responsive";
import { NavItem } from "@/components/nav-main";

interface MobileNavigationProps {
  items: NavItem[];
  className?: string;
}

export function MobileNavigation({ items, className }: MobileNavigationProps) {
  const [open, setOpen] = React.useState(false);
  const { isMobile } = useResponsive();

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md",
              "hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-secondary",
              "transition-colors duration-200"
            )}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Abrir menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-80 p-0 bg-sidebar border-sidebar-border"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Navegación
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 hover:bg-sidebar-accent"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-2">
              <MobileNavItems
                items={items}
                onItemClick={() => setOpen(false)}
              />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface MobileNavItemsProps {
  items: NavItem[];
  onItemClick: () => void;
  level?: number;
}

function MobileNavItems({
  items,
  onItemClick,
  level = 0,
}: MobileNavItemsProps) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <MobileNavItem
          key={index}
          item={item}
          onItemClick={onItemClick}
          level={level}
        />
      ))}
    </div>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  onItemClick: () => void;
  level: number;
}

function MobileNavItem({ item, onItemClick, level }: MobileNavItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onItemClick();
    }
  };

  const paddingLeft = level * 16 + 12; // Indentation for nested items

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "w-full flex items-center gap-3 rounded-md text-left transition-colors duration-200",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
              "text-sidebar-foreground text-sm font-medium",
              // Enhanced touch targets for mobile
              "min-h-[44px] px-3 py-2",
              level > 0 && "text-xs"
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {Icon && (
              <Icon
                className={cn("shrink-0", level === 0 ? "h-5 w-5" : "h-4 w-4")}
              />
            )}
            <span className="flex-1 truncate">{item.title}</span>
            {hasChildren && (
              <ChevronRightIcon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </button>
        </CollapsibleTrigger>

        {hasChildren && (
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="pt-1">
              <MobileNavItems
                items={item.children!}
                onItemClick={onItemClick}
                level={level + 1}
              />
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

// Mobile-specific navigation trigger for page headers
export function MobileNavTrigger({ className }: { className?: string }) {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-md md:hidden",
        "hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
    >
      <MenuIcon className="h-5 w-5" />
      <span className="sr-only">Abrir menú</span>
    </Button>
  );
}
