"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Ene", propiedades: 12, terrenos: 8 },
  { month: "Feb", propiedades: 15, terrenos: 6 },
  { month: "Mar", propiedades: 18, terrenos: 10 },
  { month: "Abr", propiedades: 22, terrenos: 12 },
  { month: "May", propiedades: 25, terrenos: 9 },
  { month: "Jun", propiedades: 20, terrenos: 15 },
]

const chartConfig = {
  propiedades: {
    label: "Propiedades",
    color: "hsl(213, 12%, 25%)", // arsenic
  },
  terrenos: {
    label: "Terrenos",
    color: "hsl(24, 24%, 75%)", // darkVanilla
  },
}

export function PropertyChart() {
  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic">Actividad Mensual</CardTitle>
        <CardDescription className="text-blackCoral">Propiedades y terrenos agregados por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-blackCoral" />
              <YAxis tickLine={false} axisLine={false} className="text-blackCoral" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="propiedades" fill="var(--color-propiedades)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="terrenos" fill="var(--color-terrenos)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
