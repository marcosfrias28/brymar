"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

type UploadedImage = { url: string; name: string; size: number; type: string };

type ImageDropzoneProps = {
  value?: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
};

export function ImageDropzone({ value = [], onChange }: ImageDropzoneProps) {
  const [items, setItems] = useState<UploadedImage[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [qualityHints, setQualityHints] = useState<Record<string, { message: string; quality: "low" | "good" | "high" }>>({});

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: UploadedImage[] = [...items];
    
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 10 * 1024 * 1024) continue;
      const exists = next.find((i) => i.name === f.name && i.size === f.size);
      if (exists) continue;
      
      const url = URL.createObjectURL(f);
      next.push({ url, name: f.name, size: f.size, type: f.type });
      
      const img = new Image();
      img.onload = () => {
        const pixels = img.width * img.height;
        const nameKey = `${f.name}-${f.size}`;
        if (pixels < 800 * 600) {
          setQualityHints((q) => ({ ...q, [nameKey]: { message: "Baja resolución", quality: "low" } }));
        } else if (pixels > 1920 * 1080) {
          setQualityHints((q) => ({ ...q, [nameKey]: { message: "Alta calidad", quality: "high" } }));
        } else {
          setQualityHints((q) => ({ ...q, [nameKey]: { message: "Óptima", quality: "good" } }));
        }
      };
      img.src = url;
    }
    
    setItems(next);
    onChange(next);
  };

  const removeImage = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-accent/20",
          "cursor-pointer"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-3 p-12">
          <div className={cn(
            "rounded-full p-4 transition-all duration-300",
            isDragging 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? "¡Suelta las imágenes aquí!" : "Arrastra imágenes o haz clic"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PNG, JPG, WEBP hasta 10MB
            </p>
          </div>
          
          <Button 
            variant="default" 
            size="lg"
            className="mt-2 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }} 
            type="button"
          >
            <ImageIcon className="h-4 w-4" />
            Seleccionar archivos
          </Button>
        </div>
        
        {/* Efecto shimmer en hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="animate-shimmer absolute inset-0" />
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      
      {items.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {items.length} {items.length === 1 ? "imagen subida" : "imágenes subidas"}
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setItems([]);
                onChange([]);
              }}
              className="h-8 text-xs"
            >
              Limpiar todo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((img, index) => {
              const hint = qualityHints[`${img.name}-${img.size}`];
              return (
                <div 
                  key={`${img.name}-${img.size}`} 
                  className="group relative overflow-hidden rounded-xl border-2 border-border bg-card transition-all duration-300 hover:border-primary hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.url || "/placeholder.svg"} 
                    alt={img.name} 
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  
                  {/* Badge de calidad */}
                  {hint && (
                    <div className={cn(
                      "absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm",
                      hint.quality === "low" && "bg-destructive/90 text-destructive-foreground",
                      hint.quality === "good" && "bg-accent/90 text-accent-foreground",
                      hint.quality === "high" && "bg-primary/90 text-primary-foreground"
                    )}>
                      {hint.quality === "high" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : hint.quality === "low" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {hint.message}
                    </div>
                  )}
                  
                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-destructive hover:scale-110 group-hover:opacity-100"
                    type="button"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  
                  {/* Nombre del archivo */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="truncate text-xs text-white">{img.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
