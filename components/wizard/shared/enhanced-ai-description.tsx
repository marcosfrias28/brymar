"use client";

import { useState, useCallback, useEffect } from "react";
import { PropertyBasicInfo } from "@/types/wizard";
import { RichTextContent } from "@/hooks/use-ai-generation";
import { AdvancedRichTextEditor } from "@/components/ui/advanced-rich-text-editor";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Wand2,
  Sparkles,
  Edit3,
  Save,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIGeneration } from "@/hooks/use-ai-generation";

interface EnhancedAIDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  propertyData: PropertyBasicInfo | null;
  placeholder?: string;
  className?: string;
  isMobile?: boolean;
  disabled?: boolean;
}

export function EnhancedAIDescription({
  value,
  onChange,
  propertyData,
  placeholder = "Describe las características principales de la propiedad...",
  className,
  isMobile = false,
  disabled = false,
}: EnhancedAIDescriptionProps) {
  const [isRichTextMode, setIsRichTextMode] = useState(false);
  const [richContent, setRichContent] = useState<RichTextContent>({
    html: "",
    plainText: value,
    formatted: false,
  });
  const [showFallbackWarning, setShowFallbackWarning] = useState(false);

  // AI Generation with rich text support
  const {
    isGenerating,
    error: aiError,
    generateDescription,
    clearState: clearAIState,
  } = useAIGeneration({
    language: "es",
    useRichText: true,
    onSuccess: (type, content) => {
      if (type === "description") {
        if (typeof content === "object" && content.html) {
          // Rich text content
          setRichContent(content as RichTextContent);
          setIsRichTextMode(true);
          onChange(content.plainText);
          setShowFallbackWarning(!content.formatted);
        } else if (typeof content === "string") {
          // Plain text fallback
          onChange(content);
          setShowFallbackWarning(true);
        }
      }
    },
    onError: (error) => {
      console.error("AI generation error:", error);
      setShowFallbackWarning(true);
    },
  });

  // Update rich content when value changes externally
  useEffect(() => {
    if (!isRichTextMode) {
      setRichContent((prev) => ({
        ...prev,
        plainText: value,
      }));
    }
  }, [value, isRichTextMode]);

  const canGenerateAI = useCallback(() => {
    return !!(
      propertyData &&
      propertyData.type
    );
  }, [propertyData]);

  const handleGenerateDescription = useCallback(async () => {
    if (!propertyData || !canGenerateAI()) return;

    setShowFallbackWarning(false);
    clearAIState();
    await generateDescription(propertyData);
  }, [propertyData, canGenerateAI, clearAIState, generateDescription]);

  const handleRichTextChange = useCallback(
    (html: string) => {
      // Convert HTML to plain text for form submission
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      setRichContent((prev) => ({
        ...prev,
        html,
        plainText,
        formatted: true,
      }));

      onChange(plainText);
    },
    [onChange]
  );

  const handleSaveRichText = useCallback(() => {
    // Rich text is already saved via onChange
    setIsRichTextMode(false);
  }, []);

  const handleCancelRichText = useCallback(() => {
    // Revert to plain text mode without saving changes
    setRichContent((prev) => ({
      ...prev,
      html: "",
      formatted: false,
    }));
    setIsRichTextMode(false);
  }, []);

  const handleSwitchToRichText = useCallback(() => {
    // Convert current plain text to rich text
    const html = value
      .split("\n\n")
      .map((paragraph) =>
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""
      )
      .filter(Boolean)
      .join("\n");

    setRichContent({
      html: html || `<p>${value}</p>`,
      plainText: value,
      formatted: true,
    });
    setIsRichTextMode(true);
  }, [value]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Generation Section */}
      <Card
        className={cn(
          "border-dashed border-primary/20 bg-primary/5",
          isMobile && "border-0 shadow-none"
        )}
      >
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle
            className={cn(
              "flex items-center gap-2",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            <Wand2
              className={cn("text-primary", isMobile ? "w-4 h-4" : "w-5 h-5")}
            />
            Generación Inteligente de Descripción
          </CardTitle>
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            Genera descripciones detalladas y profesionales con formato rico
            usando IA
          </p>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0 space-y-3" : "space-y-4")}>
          {aiError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{aiError}</p>
              </div>
            </div>
          )}

          {showFallbackWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Se usó contenido de respaldo. La IA podría no estar disponible
                  temporalmente.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={handleGenerateDescription}
              disabled={!canGenerateAI() || isGenerating || disabled}
              className={cn("flex-1", isMobile && "min-h-[48px] text-base")}
            >
              {isGenerating ? (
                <Loader2
                  className={cn(
                    "animate-spin mr-2",
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  )}
                />
              ) : (
                <Sparkles
                  className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
                />
              )}
              {isGenerating ? "Generando..." : "Generar Descripción Rica"}
            </Button>

            {!isRichTextMode && value && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSwitchToRichText}
                disabled={disabled}
                className={cn(isMobile && "min-h-[48px]")}
              >
                <Edit3
                  className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
                />
                Editar con Formato
              </Button>
            )}
          </div>

          {!canGenerateAI() && (
            <p
              className={cn(
                "text-muted-foreground text-center",
                isMobile ? "text-xs px-2" : "text-xs"
              )}
            >
              Completa el tipo de propiedad, precio y superficie para usar la IA
            </p>
          )}
        </CardContent>
      </Card>

      {/* Description Input */}
      <div>
        <Label
          htmlFor="description"
          className={cn(isMobile ? "text-sm font-medium" : "")}
        >
          Descripción de la Propiedad *
        </Label>

        {isRichTextMode ? (
          <div className="mt-2">
            <AdvancedRichTextEditor
              content={richContent.html}
              onChange={handleRichTextChange}
              onSave={handleSaveRichText}
              onCancel={handleCancelRichText}
              placeholder={placeholder}
              className="min-h-[300px]"
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Modo de edición rica activado. Los cambios se guardan
              automáticamente.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              id="description"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={isMobile ? 4 : 6}
              disabled={disabled}
              className={cn("mt-2", isMobile && "text-base")}
            />
            {value && value.trim() && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Vista previa con formato:
                  </span>
                </div>
                <MarkdownRenderer 
                  content={value}
                  variant="compact"
                  className="text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
