"use client";

import { UnifiedCard, CardAction, CardBadge } from "./unified-card";
import { Edit, Eye, MapPin, Square, TreePine } from "lucide-react";

interface LandCardProps {
  land: {
    id: string;
    name: string;
    price: number;
    area: number;
    location: string;
    type: string;
    images?: string[];
    status?: string;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function LandCard({
  land,
  showActions = true,
  onEdit,
  onView,
}: LandCardProps) {
  const badges: CardBadge[] = [
    {
      label: land.type,
      variant: "secondary",
    },
  ];

  if (land.status) {
    badges.push({
      label: land.status,
      variant: land.status === "available" ? "default" : "outline",
    });
  }

  const pricePerM2 = Math.round(land.price / land.area);
  const hectares = (land.area / 10000).toFixed(4);

  const metadata = [
    { icon: MapPin, label: "Ubicación", value: land.location },
    { icon: Square, label: "Área", value: `${land.area.toLocaleString()} m²` },
    { icon: TreePine, label: "Hectáreas", value: `${hectares} ha` },
    { label: "Precio/m²", value: `$${pricePerM2.toLocaleString()}` },
  ];

  const actions: CardAction[] = [];

  if (showActions) {
    if (onView) {
      actions.push({
        label: "Ver",
        icon: Eye,
        onClick: () => onView(land.id),
        variant: "outline",
      });
    }

    if (onEdit) {
      actions.push({
        label: "Editar",
        icon: Edit,
        onClick: () => onEdit(land.id),
        variant: "default",
      });
    }
  }

  return (
    <UnifiedCard
      title={land.name}
      subtitle={`$${land.price.toLocaleString()} USD`}
      image={land.images?.[0]}
      imageAlt={land.name}
      badges={badges}
      metadata={metadata}
      actions={actions}
      href={!showActions ? `/lands/${land.id}` : undefined}
    />
  );
}
