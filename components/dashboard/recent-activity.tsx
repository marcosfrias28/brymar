"use client"

import { Clock, Building2, MapPin, FileText, Eye } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "published":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "sold":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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
  const { language } = useLangStore()
  const t = translations[language].dashboard

  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-arsenic flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t.recentActivity}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white bg-transparent"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Todo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg border border-blackCoral/20 hover:bg-azureishWhite/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-arsenic">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-arsenic">{activity.title}</p>
                    <p className="text-sm text-blackCoral">
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>{getStatusText(activity.status)}</Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
