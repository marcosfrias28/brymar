"use client";
import Link from "next/link";
import { ArrowLeft, Home, Plus } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlogCreator } from "@/components/creator/BlogCreator";

export default function BlogNewPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Blog", href: "/dashboard/blog" },
    { label: "Nuevo", icon: Plus },
  ];

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
      description="Crea un nuevo post con validación e IA"
      title="Nuevo Post"
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Blog</CardTitle>
          <CardDescription>Completa los campos y guarda el borrador</CardDescription>
        </CardHeader>
        <CardContent>
          <BlogCreator />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}