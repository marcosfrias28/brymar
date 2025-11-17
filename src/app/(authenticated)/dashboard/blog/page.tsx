"use client";

import { BookOpen, Home, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { StandardCardList } from "@/components/dashboard/standard-card-list";
import { UnifiedDashboardLayout } from "@/components/dashboard/unified-dashboard-layout";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import type { BlogPost } from "@/lib/types/blog";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function BlogPage() {
	const { data: blogPostsData, isLoading: loading, error } = useBlogPosts();
	const blogPosts = blogPostsData?.posts || [];
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "draft"
	>("all");

	const filteredByStatus = useMemo(() => {
		if (!blogPosts) {
			return [];
		}
		return statusFilter === "all"
			? blogPosts
			: blogPosts.filter((p: BlogPost) => p.status === statusFilter);
	}, [blogPosts, statusFilter]);

	const statsCards = useMemo(() => {
		const adapter = getStatsAdapter("blog");
		return adapter?.generateStats({ posts: blogPosts }) || [];
	}, [blogPosts]);

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Blog" },
	];

    const actions: { label: string; icon: any; href: string; variant: "default" | "outline" }[] = [];

	const filterChips = [
		{
			label: "Todos",
			value: "all",
			active: statusFilter === "all",
			onClick: () => setStatusFilter("all"),
		},
		{
			label: "Publicados",
			value: "published",
			active: statusFilter === "published",
			onClick: () => setStatusFilter("published"),
		},
		{
			label: "Borradores",
			value: "draft",
			active: statusFilter === "draft",
			onClick: () => setStatusFilter("draft"),
		},
	];

	if (error) {
		return (
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Error al cargar los posts del blog"
				loading={loading}
				searchPlaceholder="Buscar posts..."
				showSearch={true}
				stats={statsCards}
				title="Gestión del Blog"
			>
				<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
					<p className="text-destructive">
						Error al cargar los posts:{" "}
						{error instanceof Error ? error.message : String(error)}
					</p>
					<Button onClick={() => window.location.reload()} variant="outline">
						Reintentar
					</Button>
				</div>
			</UnifiedDashboardLayout>
		);
	}

	return (
		<RouteGuard requiredPermission="blog.manage">
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Administra y publica contenido del blog inmobiliario"
				filterChips={filterChips}
				loading={loading}
				searchPlaceholder="Buscar posts..."
				showSearch={true}
				stats={statsCards}
				title="Gestión del Blog"
			>
				<StandardCardList
					className="mt-6"
					items={filteredByStatus}
					onDelete={(id) => {
						// Handle delete logic here
						console.log("Delete blog post:", id);
					}}
					onEdit={(id) => {
						// Handle edit logic here
						console.log("Edit blog post:", id);
					}}
					onView={(id) => {
						// Handle view logic here
						console.log("View blog post:", id);
					}}
					showActions={true}
					type="blog"
					variant="list"
				/>
			</UnifiedDashboardLayout>
		</RouteGuard>
	);
}
