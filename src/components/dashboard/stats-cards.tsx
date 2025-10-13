"use client";

import { Building2, MapPin, FileText, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProperties } from '@/hooks/use-properties';
import { useLands } from '@/hooks/use-lands';
import { useBlogPosts } from '@/hooks/use-blog';

export function StatsCards() {
  const { properties, loading: propertiesLoading } = useProperties();
  const { lands, loading: landsLoading } = useLands();
  const { blogPosts, loading: postsLoading } = useBlogPosts();

  const isLoading = propertiesLoading || landsLoading || postsLoading;

  const statsData = [
    {
      title: "Total Propiedades",
      value: properties.length.toString(),
      change: "+12%",
      icon: Building2,
      color: "bg-primary",
    },
    {
      title: "Total Terrenos",
      value: lands.length.toString(),
      change: "+8%",
      icon: MapPin,
      color: "bg-secondary",
    },
    {
      title: "Total Posts",
      value: blogPosts.length.toString(),
      change: "+15%",
      icon: FileText,
      color: "bg-accent",
    },
    {
      title: "Ventas del Mes",
      value: properties.filter((p) => p.status === "sale").length.toString(),
      change: "+23%",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-muted to-accent",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 smartphone:grid-cols-2 laptop:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="border-blackCoral shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 smartphone:grid-cols-2 laptop:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="border-border shadow-lg hover:shadow-xl hover:border-secondary/20 transition-all duration-200"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary-foreground bg-secondary/20 px-1.5 py-0.5 rounded-full font-medium">
                {stat.change}
              </span>{" "}
              desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
