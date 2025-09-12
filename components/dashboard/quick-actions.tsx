"use client"

import { Plus, Building2, MapPin, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const quickActions = [
  {
    title: "Agregar Propiedad",
    href: "/dashboard/properties/new",
    icon: Building2,
    color: "bg-arsenic hover:bg-blackCoral",
  },
  {
    title: "Agregar Terreno",
    href: "/dashboard/lands/new",
    icon: MapPin,
    color: "bg-blackCoral hover:bg-arsenic",
  },
  {
    title: "Agregar Post",
    href: "/dashboard/blog/new",
    icon: FileText,
    color: "bg-aurora hover:opacity-90",
  },
]

export function QuickActions() {

  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Button key={index} asChild className={`w-full justify-start ${action.color} text-white`}>
            <Link href={action.href}>
              <action.icon className="h-4 w-4 mr-2" />
              {action.title}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
