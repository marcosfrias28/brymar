"use client";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserIcon, 
  MoreVerticalIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ShieldIcon,
  UserCheckIcon,
  MailIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  // Mock data for demonstration
  const users = [
    {
      id: "1",
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      role: "admin",
      status: "active",
      avatar: null,
      lastLogin: "2024-01-15",
      properties: 12
    },
    {
      id: "2", 
      name: "María García",
      email: "maria.garcia@example.com",
      role: "agent",
      status: "active",
      avatar: null,
      lastLogin: "2024-01-14",
      properties: 8
    },
    {
      id: "3",
      name: "Carlos López",
      email: "carlos.lopez@example.com", 
      role: "user",
      status: "inactive",
      avatar: null,
      lastLogin: "2024-01-10",
      properties: 3
    },
    {
      id: "4",
      name: "Ana Martínez",
      email: "ana.martinez@example.com",
      role: "agent",
      status: "active", 
      avatar: null,
      lastLogin: "2024-01-15",
      properties: 15
    }
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "agent":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return ShieldIcon;
      case "agent":
        return UserCheckIcon;
      default:
        return UserIcon;
    }
  };

  return (
    <DashboardPageLayout
      title="Gestión de Usuarios"
      description="Administra usuarios, roles y permisos de la plataforma"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <div className="relative flex-1 sm:max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Invitar Usuario
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <ShieldIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Acceso completo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes</CardTitle>
              <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'agent').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Gestión de propiedades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Gestiona los usuarios registrados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MailIcon className="h-3 w-3" />
                            {user.email}
                          </div>
                          <span>•</span>
                          <span>{user.properties} propiedades</span>
                          <span>•</span>
                          <span>Último acceso: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Roles</CardTitle>
            <CardDescription>
              Configura los permisos y accesos por rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldIcon className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">Administrador</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Acceso completo a todas las funciones
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Gestión de usuarios</li>
                  <li>• Analytics completos</li>
                  <li>• Configuración del sistema</li>
                  <li>• Gestión de propiedades</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheckIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Agente</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Gestión de propiedades y terrenos
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Crear propiedades</li>
                  <li>• Gestionar terrenos</li>
                  <li>• Ver analytics básicos</li>
                  <li>• Acceso al dashboard</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Usuario</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Acceso básico a funciones públicas
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Ver propiedades</li>
                  <li>• Gestionar perfil</li>
                  <li>• Favoritos</li>
                  <li>• Búsquedas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}