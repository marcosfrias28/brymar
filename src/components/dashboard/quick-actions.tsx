"use client";

import { Plus, Building2, MapPin, FileText, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DraftList } from '@/components/wizard/draft-list';
import Link from "next/link";
import { secondaryColorClasses } from '@/lib/utils/secondary-colors';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    title: "Agregar Propiedad",
    href: "/dashboard/properties/new",
    icon: Building2,
    description: "Crear con asistente IA",
  },
  {
    title: "Agregar Terreno",
    href: "/dashboard/lands/new",
    icon: MapPin,
    description: "Registrar nuevo terreno",
  },
  {
    title: "Agregar Post",
    href: "/dashboard/blog/new",
    icon: FileText,
    description: "Escribir artículo del blog",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <Card className="hover:border-secondary/20 hover:shadow-md transition-all duration-200">
        <CardHeader className="border-b border-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                secondaryColorClasses.accentHover,
                "focus-visible:ring-secondary/50"
              )}
            >
              <Link href={action.href} className="flex items-center gap-3">
                <div
                  className={cn("p-2 rounded-lg", secondaryColorClasses.accent)}
                >
                  <action.icon className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Recent Drafts */}
      <DraftList
        maxItems={3}
        showActions={false}
        onSelectDraft={(draftId) => {
          window.location.href = `/dashboard/properties/new?draft=${draftId}`;
        }}
      />
    </div>
  );
}
