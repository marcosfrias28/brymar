"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Loader2, Phone, Mail, MapPin, Globe } from "lucide-react";
import {
  createContactInfo,
  updateContactInfo,
} from '@/lib/actions/sections-actions';
import { useContactInfoMutations } from '@/hooks/mutations/use-contact-info-mutations';
import type { ContactInfo } from '@/lib/db/schema';
import { toast } from "sonner";

interface ContactInfoEditorProps {
  contact: ContactInfo | null;
  onClose: () => void;
}

const contactTypes = [
  { value: "phone", label: "Teléfono", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "address", label: "Dirección", icon: MapPin },
  { value: "website", label: "Sitio Web", icon: Globe },
  { value: "facebook", label: "Facebook", icon: Globe },
  { value: "instagram", label: "Instagram", icon: Globe },
  { value: "twitter", label: "Twitter", icon: Globe },
];

export function ContactInfoEditor({
  contact,
  onClose,
}: ContactInfoEditorProps) {
  const [formData, setFormData] = useState({
    type: contact?.type || "",
    label: contact?.label || "",
    value: contact?.value || "",
    icon: contact?.icon || "",
    isActive: contact?.isActive ?? true,
    order: contact?.order || 0,
  });

  const { createContactInfo, updateContactInfo, isLoading } =
    useContactInfoMutations();
  const isEditing = !!contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const mutationData = {
        type: formData.type,
        label: formData.label,
        value: formData.value,
        icon: formData.icon,
        isActive: formData.isActive,
        order: formData.order,
      };

      if (isEditing) {
        await updateContactInfo.mutateAsync({
          id: contact.id,
          ...mutationData,
        });
      } else {
        await createContactInfo.mutateAsync(mutationData);
      }

      onClose();
    } catch (error) {
      // Error handling is done by the mutation hooks
      console.error("Error:", error);
    }
  };

  const handleTypeChange = (type: string) => {
    const selectedType = contactTypes.find((t) => t.value === type);
    setFormData({
      ...formData,
      type,
      icon: selectedType?.value || "",
      label: formData.label || selectedType?.label || "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isEditing ? "Editar Contacto" : "Nuevo Contacto"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? `Editando información de contacto`
                  : `Agregando nueva información de contacto`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Contacto</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="label">Etiqueta</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Ej: Teléfono Principal, Email Soporte"
                required
              />
            </div>

            <div>
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={
                  formData.type === "phone"
                    ? "+1 (555) 123-4567"
                    : formData.type === "email"
                    ? "contacto@marbry.com"
                    : formData.type === "address"
                    ? "123 Main St, Miami, FL"
                    : "Valor del contacto"
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Activo</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar en el sitio web
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div>
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
