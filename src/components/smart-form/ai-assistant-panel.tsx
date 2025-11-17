"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Wand2, Tag, FileText, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

type AIAssistantPanelProps = {
  onGenerateTitle: () => Promise<void>;
  onGenerateDescription: () => Promise<void>;
  onGenerateTags: () => Promise<void>;
  onGenerateAll: () => Promise<void>;
  isLoading?: boolean;
};

export function AIAssistantPanel({
  onGenerateTitle,
  onGenerateDescription,
  onGenerateTags,
  onGenerateAll,
  isLoading = false
}: AIAssistantPanelProps) {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-primary p-2">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Asistente Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Deja que la IA te ayude a crear contenido atractivo y optimizado para SEO
            </p>
          </div>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 border-2 p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5"
            onClick={onGenerateTitle}
            disabled={isLoading}
          >
            <div className="flex w-full items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold">Generar Título</span>
            </div>
            <span className="text-left text-xs text-muted-foreground">
              Título llamativo y optimizado
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 border-2 p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5"
            onClick={onGenerateDescription}
            disabled={isLoading}
          >
            <div className="flex w-full items-center gap-2">
              <Wand2 className="h-4 w-4 text-accent" />
              <span className="font-semibold">Generar Descripción</span>
            </div>
            <span className="text-left text-xs text-muted-foreground">
              Descripción detallada y atractiva
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 border-2 p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5"
            onClick={onGenerateTags}
            disabled={isLoading}
          >
            <div className="flex w-full items-center gap-2">
              <Tag className="h-4 w-4 text-chart-3" />
              <span className="font-semibold">Generar Tags SEO</span>
            </div>
            <span className="text-left text-xs text-muted-foreground">
              Etiquetas relevantes para búsqueda
            </span>
          </Button>
          
          <Button
            className={cn(
              "h-auto flex-col items-start gap-2 p-4",
              "bg-gradient-to-br from-primary to-accent",
              "relative overflow-hidden",
              isLoading && "animate-pulse-glow"
            )}
            onClick={onGenerateAll}
            disabled={isLoading}
          >
            <div className="flex w-full items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              )}
              <span className="font-semibold text-primary-foreground">
                {isLoading ? "Generando..." : "Generar Todo"}
              </span>
            </div>
            <span className="text-left text-xs text-primary-foreground/80">
              {isLoading ? "Por favor espera..." : "Completo con IA en segundos"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
