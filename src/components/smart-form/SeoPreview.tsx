"use client";
import { Card, CardContent } from "@/components/ui/card";

type SeoPreviewProps = {
  title: string;
  description: string;
  url: string;
};

export function SeoPreview({ title, description, url }: SeoPreviewProps) {
  return (
    <Card className="overflow-hidden border-2">
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="truncate text-sm text-muted-foreground">{url}</p>
          <h3 className="line-clamp-1 text-lg font-medium text-primary">
            {title || "Título de tu propiedad"}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description || "Descripción de tu propiedad"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
