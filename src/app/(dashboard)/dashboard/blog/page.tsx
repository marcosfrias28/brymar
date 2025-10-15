"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  User,
  PenTool,
  Plus,
  Home,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { BlogCardList } from "@/components/blog/blog-card-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlog } from "@/presentation/hooks/use-blog";
import { RouteGuard } from "@/components/auth/route-guard";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const { blogPosts, loading, error, refreshBlogPosts } = useBlog();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const filteredByStatus = useMemo(() => {
    if (!blogPosts) return [];
    return statusFilter === "all"
      ? blogPosts
      : blogPosts.filter((p: any) => p.status === statusFilter);
  }, [blogPosts, statusFilter]);

  const stats = useMemo(() => {
    if (!blogPosts) return [];
    return [
      {
        label: "Total Posts",
        value: blogPosts.length,
        icon: <FileText className="h-5 w-5" />,
        color: "text-foreground",
      },
      {
        label: "Publicados",
        value: blogPosts.filter((p: any) => p.status === "published").length,
        icon: <Calendar className="h-5 w-5" />,
        color: "text-green-600",
      },
      {
        label: "Borradores",
        value: blogPosts.filter((p: any) => p.status === "draft").length,
        icon: <PenTool className="h-5 w-5" />,
        color: "text-orange-600",
      },
      {
        label: "Autores",
        value: new Set(blogPosts.map((p: any) => p.author)).size,
        icon: <User className="h-5 w-5" />,
        color: "text-blue-600",
      },
    ];
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
        <Plus className="h-4 w-4 mr-2" />
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
          title="Gestión del Blog"
          description="Error al cargar los posts del blog"
          breadcrumbs={breadcrumbs}
        >
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="text-destructive">
              Error al cargar los posts: {error}
            </p>
            <Button onClick={refreshBlogPosts} variant="outline">
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
        title="Gestión del Blog"
        description="Administra y publica contenido del blog inmobiliario"
        breadcrumbs={breadcrumbs}
        actions={actions}
        showSearch={true}
        searchPlaceholder="Buscar posts..."
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={cn("border-border", secondaryColorClasses.cardHover)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      secondaryColorClasses.accent
                    )}
                  >
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={filter.active ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                filter.active
                  ? secondaryColorClasses.badge
                  : cn(
                      "hover:bg-secondary/10",
                      secondaryColorClasses.interactive
                    )
              )}
              onClick={() =>
                setStatusFilter(filter.value as "all" | "published" | "draft")
              }
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Blog Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-32 h-20 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredByStatus.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay posts
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {statusFilter === "all"
                  ? "Aún no has creado ningún post del blog."
                  : `No hay posts con estado "${statusFilter}".`}
              </p>
              <Button asChild className={secondaryColorClasses.focusRing}>
                <Link href="/dashboard/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer post
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredByStatus.map((post: any) => (
              <BlogCardList key={post.id} post={post} />
            ))}
          </div>
        )}
      </DashboardPageLayout>
    </RouteGuard>
  );
}
