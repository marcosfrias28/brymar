"use client"

import { useState } from "react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Bell, Globe, Palette, Database, Key } from "lucide-react"

// Mock user data - en una app real vendría de la sesión/base de datos
const mockUser = {
  id: "1",
  name: "Carlos Martínez",
  email: "carlos@marbryinmobiliaria.com",
  role: "admin", // admin, agent, viewer
  image: "/placeholder.svg?height=100&width=100",
  createdAt: "2024-01-01",
  permissions: {
    canCreateProperties: true,
    canEditProperties: true,
    canDeleteProperties: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageBlog: true,
  },
}

const rolePermissions = {
  admin: {
    label: "Administrador",
    description: "Acceso completo a todas las funciones",
    color: "bg-red-500",
    permissions: ["all"],
  },
  agent: {
    label: "Agente",
    description: "Puede gestionar propiedades y terrenos",
    color: "bg-blue-500",
    permissions: ["properties", "lands", "blog_read"],
  },
  viewer: {
    label: "Visualizador",
    description: "Solo puede ver información",
    color: "bg-gray-500",
    permissions: ["read_only"],
  },
}

export default function SettingsPage() {
  const { language, setLanguage } = useLangStore()
  const t = translations[language]

  const [user, setUser] = useState(mockUser)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    security: true,
  })
  const [theme, setTheme] = useState("light")

  const currentRole = rolePermissions[user.role as keyof typeof rolePermissions]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-arsenic font-serif">Configuración</h1>
        <p className="text-blackCoral">Gestiona tu perfil y preferencias del sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 tablet:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permisos
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tu información de perfil y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Cambiar Foto
                  </Button>
                  <p className="text-sm text-blackCoral/70 mt-1">JPG, PNG o GIF. Máximo 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-arsenic hover:bg-blackCoral">Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rol y Permisos
              </CardTitle>
              <CardDescription>Tu rol determina qué acciones puedes realizar en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Role */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentRole.color}`} />
                  <div>
                    <h3 className="font-semibold">{currentRole.label}</h3>
                    <p className="text-sm text-blackCoral/70">{currentRole.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">Rol Actual</Badge>
              </div>

              <Separator />

              {/* Permissions List */}
              <div className="space-y-4">
                <h4 className="font-semibold">Permisos Actuales</h4>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                  {Object.entries(user.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                      <Badge variant={value ? "default" : "secondary"}>{value ? "Permitido" : "Denegado"}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Comparison */}
              <div className="space-y-4">
                <h4 className="font-semibold">Comparación de Roles</h4>
                <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                  {Object.entries(rolePermissions).map(([roleKey, role]) => (
                    <Card key={roleKey} className={user.role === roleKey ? "ring-2 ring-arsenic" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`} />
                          <h5 className="font-semibold">{role.label}</h5>
                        </div>
                        <p className="text-sm text-blackCoral/70 mb-3">{role.description}</p>
                        <div className="space-y-1">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificación
              </CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key} className="text-base capitalize">
                      {key === "email" && "Notificaciones por Email"}
                      {key === "push" && "Notificaciones Push"}
                      {key === "marketing" && "Emails de Marketing"}
                      {key === "security" && "Alertas de Seguridad"}
                    </Label>
                    <p className="text-sm text-blackCoral/70">
                      {key === "email" && "Recibe actualizaciones importantes por correo"}
                      {key === "push" && "Notificaciones en tiempo real en el navegador"}
                      {key === "marketing" && "Ofertas especiales y novedades"}
                      {key === "security" && "Alertas sobre actividad sospechosa"}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Idioma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Cambiar Contraseña
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Configurar Autenticación de Dos Factores
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Ver Sesiones Activas
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestión de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Exportar Mis Datos
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Descargar Historial de Actividad
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full">
                Eliminar Cuenta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
