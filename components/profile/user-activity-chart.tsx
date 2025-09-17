"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock data for user activity chart - replace with actual user activity data
const chartData = [
  { month: "Ene", vistas: 8, favoritos: 2, busquedas: 5 },
  { month: "Feb", vistas: 12, favoritos: 3, busquedas: 7 },
  { month: "Mar", vistas: 15, favoritos: 4, busquedas: 9 },
  { month: "Abr", vistas: 18, favoritos: 5, busquedas: 8 },
  { month: "May", vistas: 22, favoritos: 6, busquedas: 12 },
  { month: "Jun", vistas: 25, favoritos: 7, busquedas: 10 }
]

const chartConfig = {
  vistas: {
    label: "Propiedades Vistas",
    color: "hsl(217, 91%, 60%)", // blue
  },
  favoritos: {
    label: "Favoritos Agregados",
    color: "hsl(0, 84%, 60%)", // red
  },
  busquedas: {
    label: "Búsquedas Realizadas",
    color: "hsl(142, 71%, 45%)", // green
  },
}

export function UserActivityChart() {
  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic">Mi Actividad</CardTitle>
        <CardDescription className="text-blackCoral">
          Tu actividad en la plataforma durante los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVistas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-vistas)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-vistas)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFavoritos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-favoritos)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-favoritos)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorBusquedas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-busquedas)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-busquedas)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                className="text-blackCoral text-xs" 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                className="text-blackCoral text-xs" 
              />
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent />} 
              />
              <Area
                type="monotone"
                dataKey="vistas"
                stroke="var(--color-vistas)"
                fillOpacity={1}
                fill="url(#colorVistas)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="favoritos"
                stroke="var(--color-favoritos)"
                fillOpacity={1}
                fill="url(#colorFavoritos)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="busquedas"
                stroke="var(--color-busquedas)"
                fillOpacity={1}
                fill="url(#colorBusquedas)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-vistas)' }}></div>
            <span className="text-muted-foreground">Propiedades Vistas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-favoritos)' }}></div>
            <span className="text-muted-foreground">Favoritos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-busquedas)' }}></div>
            <span className="text-muted-foreground">Búsquedas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}