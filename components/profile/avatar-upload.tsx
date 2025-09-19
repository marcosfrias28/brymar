"use client";

import { CircleUserRoundIcon, XIcon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  label?: string;
  name?: string;
  defaultValue?: string;
  onFileChange?: (file: File | null) => void;
  className?: string;
  error?: string;
}

export function AvatarUpload({
  label = "Avatar",
  name = "image",
  defaultValue,
  onFileChange,
  className,
  error,
}: AvatarUploadProps) {
  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxFiles: 1,
    onFilesChange: (files) => {
      const file = files[0]?.file;
      if (file instanceof File) {
        onFileChange?.(file);
      } else {
        onFileChange?.(null);
      }
    },
  })

  const previewUrl = files[0]?.preview || defaultValue || null;
  const imageValue = files[0]?.file ? files[0].preview : defaultValue || "";

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {/* Hidden input para el formulario */}
      <input
        type="hidden"
        name={name}
        value={imageValue}
      />
      <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area */}
        <button
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={previewUrl ? "Cambiar imagen" : "Subir imagen"}
        >
          {previewUrl ? (
            <img
              className="size-full object-cover"
              src={previewUrl}
              alt="Avatar preview"
              width={80}
              height={80}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-8 opacity-60" />
            </div>
          )}
        </button>
        {previewUrl && (
          <Button
            onClick={() => removeFile(files[0]?.id)}
            size="icon"
            className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none"
            aria-label="Eliminar imagen"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Subir archivo de imagen"
          tabIndex={-1}
        />
      </div>
        <p className="text-muted-foreground text-xs text-center max-w-[200px]">
          Arrastra y suelta una imagen o haz clic para seleccionar
        </p>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
