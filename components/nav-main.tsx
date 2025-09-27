"use client";

import {
  ChevronRightIcon,
  MailIcon,
  PlusCircleIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  animationPresets,
  sidebarAnimations,
  hoverAnimations,
  focusAnimations,
} from "@/lib/utils/animations";
import {
  ariaLabels,
  keyboardKeys,
  focusRingClasses,
} from "@/lib/utils/accessibility";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const menuRef = useRef<HTMLUListElement>(null);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  // Handle keyboard navigation for menu items
  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent, itemTitle: string) => {
      const { key } = event;

      if (key === keyboardKeys.ENTER || key === keyboardKeys.SPACE) {
        event.preventDefault();
        toggleItem(itemTitle);
      } else if (key === keyboardKeys.ESCAPE) {
        // Close all open items
        setOpenItems([]);
      }
    },
    []
  );

  // Handle submenu keyboard navigation
  const handleSubmenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;

    if (key === keyboardKeys.ESCAPE) {
      event.preventDefault();
      // Focus parent menu item
      const parentButton = (event.target as HTMLElement)
        .closest('[data-state="open"]')
        ?.querySelector("button");
      if (parentButton) {
        (parentButton as HTMLElement).focus();
      }
    }
  }, []);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some(
      (child) => isActive(child.url) || hasActiveChild(child)
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Crear nuevo elemento"
              aria-label="Crear nuevo elemento"
              className={cn(
                "min-w-8 bg-primary text-primary-foreground",
                "hover:bg-primary/90 hover:text-primary-foreground hover:scale-[1.02]",
                "active:bg-primary/90 active:text-primary-foreground active:scale-95",
                focusRingClasses.button,
                "transition-all duration-200 ease-out"
              )}
            >
              <PlusCircleIcon aria-hidden="true" />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              aria-label="Bandeja de entrada"
              className={cn(
                "h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0",
                hoverAnimations.gentle,
                focusRingClasses.button,
                "hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
              )}
              variant="outline"
            >
              <MailIcon aria-hidden="true" />
              <span className="sr-only">Bandeja de entrada</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu ref={menuRef} role="menu">
          {items.map((item) => {
            const isItemActive = isActive(item.url);
            const hasActiveChildren = hasActiveChild(item);
            const isOpen = openItems.includes(item.title);
            const shouldBeOpen = isOpen || hasActiveChildren;

            if (item.children && item.children.length > 0) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  open={shouldBeOpen}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <SidebarMenuItem role="none">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        aria-expanded={shouldBeOpen}
                        aria-controls={`submenu-${item.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        aria-label={`${item.title}${
                          item.children ? " - Expandir menú" : ""
                        }`}
                        role="menuitem"
                        onKeyDown={(e) => handleMenuKeyDown(e, item.title)}
                        className={cn(
                          "group/collapsible",
                          sidebarAnimations.menuItemHover,
                          focusRingClasses.default,
                          (isItemActive || hasActiveChildren) &&
                            "bg-secondary/20 text-secondary-foreground border-l-2 border-secondary font-medium"
                        )}
                      >
                        {item.icon && (
                          <item.icon
                            className="transition-transform duration-200 group-hover:scale-110"
                            aria-hidden="true"
                          />
                        )}
                        <span className="transition-all duration-200">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            aria-label={`${item.badge} elementos`}
                            className={cn(
                              "ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground shadow-sm border border-secondary/20",
                              "transition-all duration-200 hover:scale-105"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRightIcon
                          className={cn(
                            "ml-auto transition-all duration-300 ease-out",
                            shouldBeOpen && "rotate-90 text-secondary"
                          )}
                          aria-hidden="true"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      className={sidebarAnimations.expandMenu}
                      id={`submenu-${item.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <SidebarMenuSub
                        role="menu"
                        onKeyDown={handleSubmenuKeyDown}
                      >
                        {item.children.map((subItem, index) => (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            role="none"
                            className={cn(
                              "animate-fade-in",
                              index > 0 &&
                                `animation-delay-${Math.min(index * 100, 500)}`
                            )}
                          >
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                sidebarAnimations.submenuItemHover,
                                focusRingClasses.default,
                                "group relative",
                                isActive(subItem.url) &&
                                  "bg-secondary/30 text-secondary-foreground font-medium border-l-2 border-secondary ml-2"
                              )}
                            >
                              <Link
                                href={subItem.url}
                                role="menuitem"
                                aria-label={subItem.title}
                              >
                                {subItem.icon && (
                                  <subItem.icon
                                    className="transition-transform duration-200 group-hover:scale-110"
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="transition-all duration-200">
                                  {subItem.title}
                                </span>
                                {subItem.badge && (
                                  <span
                                    aria-label={`${subItem.badge} elementos`}
                                    className={cn(
                                      "ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground shadow-sm border border-secondary/20",
                                      "transition-all duration-200 hover:scale-105 hover:bg-secondary/80"
                                    )}
                                  >
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title} role="none">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "group",
                    sidebarAnimations.menuItemHover,
                    focusRingClasses.default,
                    isItemActive &&
                      "bg-secondary/20 text-secondary-foreground font-medium border-l-2 border-secondary"
                  )}
                >
                  <Link
                    href={item.url}
                    role="menuitem"
                    aria-label={item.title}
                    aria-current={isItemActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <item.icon
                        className="transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true"
                      />
                    )}
                    <span className="transition-all duration-200">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        aria-label={`${item.badge} elementos`}
                        className={cn(
                          "ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground shadow-sm border border-secondary/20",
                          "transition-all duration-200 hover:scale-105 hover:bg-secondary/80"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
