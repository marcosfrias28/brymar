"use client"

import { Clock, Building2, MapPin, FileText, Eye, MoreHorizontal } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const recentActivities = [
  {
    id: 1,
    type: "property",
    title: "Casa en Punta Cana",
    action: "Agregada",
    time: "Hace 2 horas",
    status: "active",
  },
  {
    id: 2,
    type: "land",
    title: "Terreno en Bávaro",
    action: "Editada",
    time: "Hace 4 horas",
    status: "pending",
  },
  {
    id: 3,
    type: "blog",
    title: "Guía de Inversión Inmobiliaria 2024",
    action: "Publicada",
    time: "Hace 1 día",
    status: "published",
  },
  {
    id: 4,
    type: "property",
    title: "Apartamento en Santo Domingo",
    action: "Vendida",
    time: "Hace 2 días",
    status: "sold",
  },
  {
    id: 5,
    type: "land",
    title: "Lote en La Romana",
    action: "Agregada",
    time: "Hace 3 días",
    status: "active",
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "property":
      return Building2
    case "land":
      return MapPin
    case "blog":
      return FileText
    default:
      return Clock
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-primary/10 text-primary border-primary/20"
    case "pending":
      return "bg-secondary/10 text-secondary-foreground border-secondary/20"
    case "published":
      return "bg-accent/10 text-accent-foreground border-accent/20"
    case "sold":
      return "bg-muted/10 text-muted-foreground border-muted/20"
    default:
      return "bg-muted/10 text-muted-foreground border-muted/20"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Activa"
    case "pending":
      return "Pendiente"
    case "published":
      return "Publicada"
    case "sold":
      return "Vendida"
    default:
      return "Desconocido"
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Actividad Reciente</CardTitle>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <a href="#">
            Ver Todo
            <Eye className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentActivities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} • {activity.time}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(activity.status)}>
                    {getStatusText(activity.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
