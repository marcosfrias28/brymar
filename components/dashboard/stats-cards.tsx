"use client";

import { Building2, MapPin, FileText, TrendingUp } from "lucide-react";
import { useLangStore } from "@/utils/store/lang-store";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statsData = [
  {
    title: "properties",
    value: "127",
    change: "+12%",
    icon: Building2,
    color: "bg-aurora",
  },
  {
    title: "lands",
    value: "43",
    change: "+8%",
    icon: MapPin,
    color: "bg-arsenic",
  },
  {
    title: "blog",
    value: "28",
    change: "+15%",
    icon: FileText,
    color: "bg-black-coral",
  },
  {
    title: "Ventas del Mes",
    value: "15",
    change: "+23%",
    icon: TrendingUp,
    color: "bg-gradient-to-r from-dark-vanilla to-azureish-white",
  },
];

export function StatsCards() {
  const { language } = useLangStore();
  const t = translations[language].dashboard;

  return (
    <div className="grid grid-cols-1 smartphone:grid-cols-2 laptop:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        let displayTitle;
        if (stat.title === "Ventas del Mes") {
          displayTitle = stat.title;
        } else {
          const translationKey = stat.title as keyof typeof t;
          displayTitle = typeof t[translationKey] === 'string' ? t[translationKey] : stat.title;
        }

        return (
          <Card
            key={index}
            className="border-black-coral shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black-coral">
                {displayTitle}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-arsenic">{stat.value}</div>
              <p className="text-xs text-black-coral">
                <span className="text-green-600">{stat.change}</span> desde el mes
                pasado
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
