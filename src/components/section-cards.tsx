import {
  TrendingDownIcon,
  TrendingUpIcon,
  Building2,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { secondaryColorClasses } from '@/lib/utils/secondary-colors';
import { cn } from '@/lib/utils';

const statsData = [
  {
    title: "Propiedades Activas",
    value: "142",
    change: "+12.5%",
    trend: "up",
    description: "Propiedades disponibles para venta",
    icon: Building2,
  },
  {
    title: "Nuevos Clientes",
    value: "1,234",
    change: "-2.1%",
    trend: "down",
    description: "Clientes registrados este mes",
    icon: Users,
  },
  {
    title: "Terrenos Disponibles",
    value: "89",
    change: "+8.2%",
    trend: "up",
    description: "Terrenos en inventario",
    icon: BarChart3,
  },
  {
    title: "Posts Publicados",
    value: "24",
    change: "+15.3%",
    trend: "up",
    description: "Artículos del blog este mes",
    icon: FileText,
  },
];

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";

        return (
          <Card
            key={index}
            className={cn(
              "relative overflow-hidden transition-all duration-200",
              secondaryColorClasses.cardHover,
              "border-l-4 border-l-secondary/30"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {stat.title}
                </CardDescription>
                <div
                  className={cn("p-2 rounded-lg", secondaryColorClasses.accent)}
                >
                  <Icon className="h-4 w-4 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isPositive
                        ? "text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950"
                        : "text-red-700 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUpIcon className="h-3 w-3" />
                    ) : (
                      <TrendingDownIcon className="h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.description}
              </p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
