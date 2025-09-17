"use client"

import { Clock, Heart, Eye, Search, Building2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

// Mock data for user activity - replace with actual user activity
const userActivities = [
  {
    id: 1,
    type: "favorite",
    title: "Villa Moderna en Punta Cana",
    action: "Agregada a favoritos",
    time: "Hace 2 horas",
    icon: Heart,
    color: "text-red-500",
    href: "/properties/1"
  },
  {
    id: 2,
    type: "view",
    title: "Apartamento Frente al Mar",
    action: "Vista de propiedad",
    time: "Hace 4 horas",
    icon: Eye,
    color: "text-blue-500",
    href: "/properties/2"
  },
  {
    id: 3,
    type: "search",
    title: "Propiedades en Punta Cana",
    action: "Búsqueda realizada",
    time: "Hace 1 día",
    icon: Search,
    color: "text-green-500",
    href: "/search?location=punta-cana"
  },
  {
    id: 4,
    type: "view",
    title: "Casa Colonial en Santo Domingo",
    action: "Vista de propiedad",
    time: "Hace 2 días",
    icon: Eye,
    color: "text-blue-500",
    href: "/properties/3"
  },
  {
    id: 5,
    type: "favorite",
    title: "Terreno en La Romana",
    action: "Agregada a favoritos",
    time: "Hace 3 días",
    icon: Heart,
    color: "text-red-500",
    href: "/properties/4"
  }
]

export function UserActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return Heart
      case 'view':
        return Eye
      case 'search':
        return Search
      case 'property':
        return Building2
      case 'land':
        return MapPin
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'favorite':
        return 'text-red-500 bg-red-50'
      case 'view':
        return 'text-blue-500 bg-blue-50'
      case 'search':
        return 'text-green-500 bg-green-50'
      case 'property':
        return 'text-purple-500 bg-purple-50'
      case 'land':
        return 'text-orange-500 bg-orange-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Badge variant="outline" className="text-red-600 border-red-200">Favorito</Badge>
      case 'view':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Vista</Badge>
      case 'search':
        return <Badge variant="outline" className="text-green-600 border-green-200">Búsqueda</Badge>
      default:
        return <Badge variant="outline">Actividad</Badge>
    }
  }

  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className={`h-8 w-8 ${colorClass}`}>
                    <AvatarFallback className={colorClass}>
                      <IconComponent className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <Link 
                          href={activity.href} 
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                        >
                          {activity.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.action}
                        </p>
                      </div>
                      {getStatusBadge(activity.type)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            
            <div className="pt-4 border-t text-center">
              <Link 
                href="/search" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Ver más actividad →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}