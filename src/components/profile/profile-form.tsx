"use client";

import { useState, useEffect, useActionState } from "react";
import { Loader2, User, Mail, Calendar, Shield, Edit3, Save, X, Settings } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { updateProfileAction } from '@/app/actions/profile-actions';
import { AvatarUpload } from "./avatar-upload";

const initialState = {
  success: false,
  message: "",
  error: undefined,
};

interface ProfileSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ProfileSection({ title, description, icon, children }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
  className?: string;
}

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="p-3 bg-gray-50 rounded-md border">
        <span className="text-sm text-gray-900">
          {value || "No especificado"}
        </span>
      </div>
    </div>
  );
}

export function ProfileForm() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  // TODO: Fix this useActionState to work with the new system
  const state = initialState;
  const formAction = async (formData: FormData) => {
    // Placeholder implementation
  };
  const isPending = false;

  useEffect(() => {
    if (state.success === true) {
      setIsEditing(false);
    }
  }, [state]);

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "No especificado";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string | null | undefined) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="text-lg">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role || 'user'}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Verificado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    form="profile-form"
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{state.error}</p>
          </CardContent>
        </Card>
      )}

      {state.success && state.message && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-600">{state.message}</p>
          </CardContent>
        </Card>
      )}

      <form id="profile-form" action={formAction} className="space-y-6">
        <ProfileSection
          title="Información Personal"
          description="Datos básicos de tu perfil"
          icon={<User className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user?.name || ""}
                  placeholder="Tu nombre completo"
                  required
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.name || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="tu@email.com"
                  required
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.email || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              {isEditing ? (
                <AvatarUpload
                  label="Avatar"
                  name="image"
                  defaultValue={user?.image || ""}
                  error={state.error}
                />
              ) : (
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  {user?.image ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.image} alt="Avatar" />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Imagen actual</p>
                        <a 
                          href={user.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Ver imagen completa
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">No hay imagen de avatar</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Información de Cuenta"
          description="Detalles de tu cuenta y configuración"
          icon={<Shield className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="ID de Usuario" value={user.id} />
            <InfoField label="Rol" value={user.role || 'user'} />
            <InfoField label="Estado de Email" value={user.emailVerified ? 'Verificado' : 'No verificado'} />
            <InfoField label="Fecha de Creación" value={formatDate(user.createdAt)} />
            <InfoField label="Última Actualización" value={formatDate(user.updatedAt)} className="md:col-span-2" />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Información Adicional"
          description="Datos complementarios de tu perfil"
          icon={<Mail className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Primer Nombre</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={user?.firstName || ""}
                  placeholder="Tu primer nombre"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.firstName || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={user?.lastName || ""}
                  placeholder="Tu apellido"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.lastName || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone || ""}
                  placeholder="Tu número de teléfono"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.phone || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              {isEditing ? (
                <Input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={user?.location || ""}
                  placeholder="Tu ubicación"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.location || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Sitio Web</Label>
              {isEditing ? (
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={user?.website || ""}
                  placeholder="https://tu-sitio-web.com"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.website || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biografía</Label>
              {isEditing ? (
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  defaultValue={user?.bio || ""}
                  placeholder="Cuéntanos sobre ti"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.bio || "No especificado"}</p>
              )}
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Preferencias"
          description="Configuración de notificaciones y privacidad"
          icon={<Settings className="h-5 w-5" />}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Notificaciones</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Email"
                  value={(user.preferences as any)?.notifications?.email ? 'Activado' : 'Desactivado'}
                />
                <InfoField
                  label="Push"
                  value={(user.preferences as any)?.notifications?.push ? 'Activado' : 'Desactivado'}
                />
                <InfoField
                  label="Marketing"
                  value={(user.preferences as any)?.notifications?.marketing ? 'Activado' : 'Desactivado'}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Privacidad</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Perfil Visible"
                  value={(user.preferences as any)?.privacy?.profileVisible ? 'Público' : 'Privado'}
                />
                <InfoField
                  label="Mostrar Email"
                  value={(user.preferences as any)?.privacy?.showEmail ? 'Visible' : 'Oculto'}
                />
                <InfoField
                  label="Mostrar Teléfono"
                  value={(user.preferences as any)?.privacy?.showPhone ? 'Visible' : 'Oculto'}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Configuración de Pantalla</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Tema"
                  value={(user.preferences as any)?.display?.theme || 'light'}
                />
                <InfoField
                  label="Idioma"
                  value={(user.preferences as any)?.display?.language || 'es'}
                />
                <InfoField
                  label="Moneda"
                  value={(user.preferences as any)?.display?.currency || 'USD'}
                />
              </div>
            </div>
          </div>
        </ProfileSection>
      </form>
    </div>
  );
}