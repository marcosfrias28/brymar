"use client";

import { useState } from "react";
import { useOrganizations, useUserWithOrganizations } from "@/hooks/use-organization";
import { OrganizationRoleGate, OrganizationPermissionGate } from "@/components/auth/organization-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Users,
  Settings,
  Crown,
  Shield,
  Eye,
  Mail,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createOrganization,
  inviteToOrganization,
  updateMemberRole,
  removeFromOrganization,
} from "@/lib/actions/organization-actions";

const roleIcons = {
  admin: Crown,
  agent: Shield,
  viewer: Eye,
};

const roleColors = {
  admin: "bg-red-500",
  agent: "bg-blue-500",
  viewer: "bg-gray-500",
};

const roleLabels = {
  admin: "Administrador",
  agent: "Agente",
  viewer: "Visualizador",
};

export default function OrganizationsPage() {
  const { user, loading: userLoading } = useUserWithOrganizations();
  const { organizations, loading: orgsLoading, refetch } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [inviteForm, setInviteForm] = useState({ email: "", role: "viewer" });
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async () => {
    if (!createForm.name.trim()) {
      toast.error("El nombre de la organización es requerido");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrganization({
        name: createForm.name,
        slug: createForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: createForm.description,
      });

      if (result) {
        toast.success("Organización creada exitosamente");
        setShowCreateDialog(false);
        setCreateForm({ name: "", description: "" });
        refetch();
      } else {
        toast.error("Error al crear la organización");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Error al crear la organización");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedOrg || !inviteForm.email.trim()) {
      toast.error("Email es requerido");
      return;
    }

    setLoading(true);
    try {
      const result = await inviteToOrganization({
        organizationId: selectedOrg,
        email: inviteForm.email,
        role: inviteForm.role,
      });

      if (result) {
        toast.success("Invitación enviada exitosamente");
        setShowInviteDialog(false);
        setInviteForm({ email: "", role: "viewer" });
      } else {
        toast.error("Error al enviar la invitación");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Error al enviar la invitación");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando organizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus organizaciones y equipos de trabajo
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Organización
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Organización</DialogTitle>
              <DialogDescription>
                Crea una nueva organización para gestionar tu equipo y proyectos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Organización</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Mi Empresa"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Descripción de la organización..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateOrganization} disabled={loading}>
                  {loading ? "Creando..." : "Crear Organización"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes organizaciones</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera organización para comenzar a colaborar con tu equipo.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Organización
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const RoleIcon = roleIcons[org.role as keyof typeof roleIcons] || Shield;
            const roleColor = roleColors[org.role as keyof typeof roleColors] || "bg-gray-500";
            const roleLabel = roleLabels[org.role as keyof typeof roleLabels] || org.role;

            return (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <OrganizationRoleGate
                      organizationId={org.id}
                      allowedRoles={["admin"]}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrg(org.id);
                              setShowInviteDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invitar Usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </OrganizationRoleGate>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Miembros del equipo
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Gestionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Usuario</DialogTitle>
            <DialogDescription>
              Invita a un nuevo miembro a tu organización.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email del Usuario</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Rol en la Organización</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizador - Solo lectura
                    </div>
                  </SelectItem>
                  <SelectItem value="agent">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Agente - Lectura y edición
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Crown className="h-4 w-4 mr-2" />
                      Administrador - Control total
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={handleInviteUser} disabled={loading}>
                {loading ? "Enviando..." : "Enviar Invitación"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}