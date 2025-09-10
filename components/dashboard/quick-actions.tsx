"use client";

import { Plus, Building2, MapPin, FileText } from "lucide-react";
import { useLangStore } from "@/utils/store/lang-store";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickActions = [
  {
    title: "addProperty",
    href: "/dashboard/properties/new",
    icon: Building2,
    color: "bg-arsenic hover:bg-black-coral",
  },
  {
    title: "addLand",
    href: "/dashboard/lands/new",
    icon: MapPin,
    color: "bg-black-coral hover:bg-arsenic",
  },
  {
    title: "addPost",
    href: "/dashboard/blog/new",
    icon: FileText,
    color: "bg-aurora hover:opacity-90",
  },
];

export function QuickActions() {
  const { language } = useLangStore();
  const t = translations[language];

  return (
    <Card className="border-black-coral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => {
          const getActionTitle = (title: string) => {
            switch (title) {
              case "addProperty":
                return t.propertyForm.addProperty;
              case "addLand":
                return t.landForm.addLand;
              case "addPost":
                return t.blogForm.addPost;
              default:
                return title;
            }
          };

          return (
            <Button
              key={index}
              asChild
              className={`w-full justify-start ${action.color} text-white`}
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4 mr-2" />
                {getActionTitle(action.title)}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
