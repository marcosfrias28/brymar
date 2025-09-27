"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Keyboard, HelpCircle } from "lucide-react";
// Removed translations import

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsGroup {
  navigation: KeyboardShortcut[];
  actions: KeyboardShortcut[];
  general: KeyboardShortcut[];
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcutsGroup;
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({
  shortcuts,
  trigger,
}: KeyboardShortcutsHelpProps) {
  // Static Spanish text instead of translations
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Keyboard className="w-4 h-4 mr-2" />
      Atajos de Teclado
    </Button>
  );

  const renderShortcutGroup = (
    title: string,
    shortcuts: KeyboardShortcut[]
  ) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
          >
            <span className="text-sm">{shortcut.description}</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5" />
            <span>Atajos de Teclado</span>
          </DialogTitle>
          <DialogDescription>
            Usa estos atajos para navegar más rápido por el asistente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderShortcutGroup("Navegación", shortcuts.navigation)}

          <Separator />

          {renderShortcutGroup("Acciones", shortcuts.actions)}

          <Separator />

          {renderShortcutGroup("General", shortcuts.general)}
        </div>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <HelpCircle className="w-4 h-4" />
          <span>
            Consejo: Mantén presionada la tecla Ctrl para ver más opciones
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
