'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/language-provider';
import { Home, Building2, Landmark, Users, Mail, Menu, X, Sun, Moon, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon:Building2, label: 'Properties', href: '/properties' },
  { icon: Landmark, label: 'Land', href: '/land' },
  { icon: Users, label: 'About Us', href: '/about' },
  { icon: Mail, label: 'Contact', href: '/contact' },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const languages = {
    en: 'English',
    es: 'Español',
    it: 'Italiano',
  };

  return (
    <aside className={cn(
      'fixed left-0 h-screen bg-background border-r border-border transition-all duration-300',
      expanded ? 'w-64' : 'w-16'
    )}>
      <nav className="h-full flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {expanded && <span className="font-semibold">Menu</span>}
        </div>

        <div className="flex-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'w-full justify-start mb-2',
                expanded ? 'px-4' : 'px-0 py-2'
              )}
              asChild
            >
              <a href={item.href}>
                <item.icon className="h-5 w-5 shrink-0" />
                {expanded && <span className="ml-2">{item.label}</span>}
              </a>
            </Button>
          ))}
        </div>

        <div className="p-4 space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-center"
              >
                <Globe2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languages).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setLanguage(code as 'en' | 'es' | 'it')}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>
    </aside>
  );
}