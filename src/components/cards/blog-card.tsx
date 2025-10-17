"use client";

import { UnifiedCard, CardAction, CardBadge } from "./unified-card";
import { Edit, Eye, Calendar, User, Clock } from "lucide-react";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    excerpt?: string;
    author: string;
    category: string;
    publishedAt?: string;
    readTime?: number;
    coverImage?: string;
    status?: string;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function BlogCard({
  post,
  showActions = true,
  onEdit,
  onView,
}: BlogCardProps) {
  const badges: CardBadge[] = [
    {
      label: post.category,
      variant: "secondary",
    },
  ];

  if (post.status) {
    badges.push({
      label: post.status,
      variant: post.status === "published" ? "default" : "outline",
    });
  }

  const metadata = [
    { icon: User, label: "Autor", value: post.author },
    {
      icon: Calendar,
      label: "Fecha",
      value: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString()
        : "Sin fecha",
    },
  ];

  if (post.readTime) {
    metadata.push({
      icon: Clock,
      label: "Lectura",
      value: `${post.readTime} min`,
    });
  }

  const actions: CardAction[] = [];

  if (showActions) {
    if (onView) {
      actions.push({
        label: "Ver",
        icon: Eye,
        onClick: () => onView(post.id),
        variant: "outline",
      });
    }

    if (onEdit) {
      actions.push({
        label: "Editar",
        icon: Edit,
        onClick: () => onEdit(post.id),
        variant: "default",
      });
    }
  }

  return (
    <UnifiedCard
      title={post.title}
      description={post.excerpt}
      image={post.coverImage}
      imageAlt={post.title}
      badges={badges}
      metadata={metadata}
      actions={actions}
      href={!showActions ? `/blog/${post.id}` : undefined}
    />
  );
}
