"use client";

import { Calendar, Clock, Edit, Eye, Trash2 } from "lucide-react";
import { useDeleteBlogPost } from "@/hooks/use-blog-posts";
import type { BlogPost } from "@/lib/types/blog";
import { formatDate } from "@/lib/utils";
import {
	type CardAction,
	type CardBadge,
	UnifiedCard,
} from "../cards/unified-card";

type BlogCardProps = {
	post: BlogPost;
	showActions?: boolean;
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
	onDelete?: (id: string) => void;
};

export function BlogCard({
	post,
	showActions = true,
	onEdit,
	onView,
	onDelete,
}: BlogCardProps) {
	const deleteMutation = useDeleteBlogPost();

	const badges: CardBadge[] = [
		{
			label: post.category,
			variant: "secondary",
		},
	];

	if (post.status) {
		badges.push({
			label: post.status === "published" ? "Publicado" : "Borrador",
			variant: post.status === "published" ? "default" : "outline",
		});
	}

	const metadata = [
		{
			icon: Calendar,
			label: "Fecha",
			value: post.publishedAt
				? formatDate(post.publishedAt)
				: formatDate(post.createdAt),
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

		if (onDelete) {
			actions.push({
				label: "Eliminar",
				icon: Trash2,
				onClick: () => {
					if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
						deleteMutation.mutate(post.id);
						onDelete(post.id);
					}
				},
				variant: "destructive",
			});
		}
	}

	return (
		<UnifiedCard
			actions={actions}
			badges={badges}
			description={post.excerpt || undefined}
			href={showActions ? undefined : `/blog/${post.slug}`}
			image={
				post.coverImage &&
				typeof post.coverImage === "object" &&
				"url" in post.coverImage
					? (post.coverImage as any).url
					: undefined
			}
			imageAlt={post.title}
			metadata={metadata}
			title={post.title}
		/>
	);
}
