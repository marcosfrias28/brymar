"use client";

import { BookOpen, Home, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { BlogCard } from "@/components/blog/blog-card";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
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
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Blog", icon: BookOpen },
	];

	const actions = (
		<Button
			asChild
			className={cn(
				"bg-primary hover:bg-primary/90",
				secondaryColorClasses.focusRing
			)}
		>
			<Link href="/dashboard/blog/new">
				<Plus className="mr-2 h-4 w-4" />
				Nuevo Post
			</Link>
		</Button>
	);

	const statusFilters = [
		{ label: "Todos", value: "all", active: statusFilter === "all" },
		{
			label: "Publicados",
			value: "published",
			active: statusFilter === "published",
		},
		{ label: "Borradores", value: "draft", active: statusFilter === "draft" },
	];

	if (error) {
		return (
			<RouteGuard requiredPermission="blog.manage">
				<DashboardPageLayout
					actions={actions}
					breadcrumbs={breadcrumbs}
					description="Error al cargar los posts del blog"
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
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredPermission="blog.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Administra y publica contenido del blog inmobiliario"
				searchPlaceholder="Buscar posts..."
				showSearch={true}
				stats={statsCards}
				statsLoading={loading}
				title="Gestión del Blog"
			>
				{/* Status Filters */}
				<div className="mb-6 flex flex-wrap gap-2">
					{statusFilters.map((filter) => (
						<Badge
							className={cn(
								"cursor-pointer transition-colors",
								filter.active
									? secondaryColorClasses.badge
									: cn(
											"hover:bg-secondary/10",
											secondaryColorClasses.interactive
										)
							)}
							key={filter.value}
							onClick={() =>
								setStatusFilter(filter.value as "all" | "published" | "draft")
							}
							variant={filter.active ? "default" : "outline"}
						>
							{filter.label}
						</Badge>
					))}
				</div>

				{/* Blog Posts List */}
				{loading ? (
					<div className="space-y-4">
						{["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
							<div
								className="animate-pulse rounded-lg border p-4"
								key={skeletonId}
							>
								<div className="flex space-x-4">
									<div className="h-20 w-32 rounded bg-muted" />
									<div className="flex-1 space-y-2">
										<div className="h-4 w-3/4 rounded bg-muted" />
										<div className="h-3 w-1/2 rounded bg-muted" />
										<div className="h-3 w-1/4 rounded bg-muted" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : filteredByStatus.length === 0 ? (
					<div className="rounded-lg border-2 border-muted-foreground/25 border-dashed p-12 text-center">
						<BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-foreground text-lg">
							No hay posts
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							{statusFilter === "all"
								? "Aún no has creado ningún post del blog."
								: `No hay posts con estado "${statusFilter}".`}
						</p>
						<Button asChild className={secondaryColorClasses.focusRing}>
							<Link href="/dashboard/blog/new">
								<Plus className="mr-2 h-4 w-4" />
								Crear primer post
							</Link>
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{filteredByStatus.map((post: BlogPost) => (
							<BlogCard key={post.id} post={post} />
						))}
					</div>
				)}
			</DashboardPageLayout>
		</RouteGuard>
	);
}
