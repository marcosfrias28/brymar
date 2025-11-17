"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Edit3, Home } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlogCreator } from "@/components/creator/BlogCreator";
import { useBlogPost } from "@/hooks/use-blog-posts";

export default function BlogEditPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data: blogPost, isLoading, error } = useBlogPost(id);
  const initialValues = useMemo(() => {
    if (!blogPost) { return; }
    const images = (blogPost.images || []).map((img: { url: string }) => ({ url: img.url }));
    const cover = (blogPost as unknown as { coverImage?: { url?: string } }).coverImage;
    const res = {
      title: blogPost.title,
      content: blogPost.content,
      excerpt: blogPost.excerpt || "",
      category: blogPost.category || "",
      slug: blogPost.slug || "",
      tags: (blogPost.tags || []).join(", "),
      images,
    };
    if (cover?.url) {
      res.coverImage = { url: cover.url };
    }
    return res;
  }, [blogPost]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Blog", href: "/dashboard/blog" },
    { label: "Editar", icon: Edit3 },
  ];

  let descriptionText = "";
  if (isLoading) {
    descriptionText = "Cargando...";
  } else if (error) {
    descriptionText = "Error al cargar";
  } else {
    descriptionText = blogPost?.title || "";
  }

  return (
    <DashboardPageLayout
      actions={
        <Button asChild variant="outline">
          <Link href="/dashboard/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Blog
          </Link>
        </Button>
      }
      breadcrumbs={breadcrumbs}
      description={descriptionText}
      title="Editar Post"
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Edición</CardTitle>
          <CardDescription>{descriptionText}</CardDescription>
        </CardHeader>
        <CardContent>
          {blogPost ? <BlogCreator initialValues={initialValues} /> : null}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}