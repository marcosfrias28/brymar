"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { getContactInfo } from "@/lib/actions/sections-actions";
import { useSections } from "@/hooks/use-sections";
import { SectionEditor } from "./section-editor";
import { ContactInfoEditor } from "./contact-info-editor";
import type { PageSection, ContactInfo } from "@/lib/db/schema";

interface SectionsManagerProps {
  page: string;
}

export function SectionsManager({ page }: SectionsManagerProps) {
  // Use optimized hook for sections
  const { sections, loading: sectionsLoading } = useSections(page);

  // Keep contact info separate since it's not part of the sections store
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
  const [contactLoading, setContactLoading] = useState(true);

  const [editingSection, setEditingSection] = useState<PageSection | null>(
    null
  );
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(
    null
  );
  const [showEditor, setShowEditor] = useState(false);
  const [showContactEditor, setShowContactEditor] = useState(false);

  // Load contact info separately
  useEffect(() => {
    if (page === "contact") {
      loadContactInfo();
    }
  }, [page]);

  const loadContactInfo = async () => {
    setContactLoading(true);
    try {
      const contacts = await getContactInfo();
      setContactInfos(contacts);
    } catch (error) {
      console.error("Error loading contact info:", error);
    } finally {
      setContactLoading(false);
    }
  };

  const loading = page === "contact" ? contactLoading : sectionsLoading;

  const handleEditSection = (section: PageSection) => {
    setEditingSection(section);
    setShowEditor(true);
  };

  const handleEditContact = (contact: ContactInfo) => {
    setEditingContact(contact);
    setShowContactEditor(true);
  };

  const handleNewSection = () => {
    setEditingSection(null);
    setShowEditor(true);
  };

  const handleNewContact = () => {
    setEditingContact(null);
    setShowContactEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setShowContactEditor(false);
    setEditingSection(null);
    setEditingContact(null);
    // Reload contact info if needed (sections are handled by the store)
    if (page === "contact") {
      loadContactInfo();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (page === "contact") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Información de Contacto</h3>
          <Button onClick={handleNewContact}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Contacto
          </Button>
        </div>

        <div className="grid gap-4">
          {contactInfos.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{contact.label}</CardTitle>
                    <Badge variant={contact.isActive ? "default" : "secondary"}>
                      {contact.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Tipo: {contact.type} | Valor: {contact.value}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {showContactEditor && (
          <ContactInfoEditor
            contact={editingContact}
            onClose={handleCloseEditor}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Secciones de {page}</h3>
        <Button onClick={handleNewSection}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sección
        </Button>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{section.section}</CardTitle>
                  <Badge variant={section.isActive ? "default" : "secondary"}>
                    {section.isActive ? (
                      <Eye className="w-3 h-3 mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 mr-1" />
                    )}
                    {section.isActive ? "Visible" : "Oculto"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSection(section)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {section.title && <span className="font-medium">Título: </span>}
                {section.title || "Sin título"}
              </CardDescription>
            </CardHeader>
            {section.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {section.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No hay secciones configuradas para esta página.
              </p>
              <Button onClick={handleNewSection} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Sección
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showEditor && (
        <SectionEditor
          section={editingSection}
          page={page}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}
