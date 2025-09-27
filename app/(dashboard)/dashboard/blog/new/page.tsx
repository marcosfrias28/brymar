"use client";

import { Home, BookOpen, Plus } from "lucide-react";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { BlogForm } from "@/components/blog/blog-form";
import { Button } from "@/components/ui/button";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { cn } from "@/lib/utils";

export default function NewBlogPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Blog", href: "/dashboard/blog", icon: BookOpen },
    { label: "Nuevo Post", icon: Plus },
  ];

  return (
    <DashboardPageLayout
      title="Crear Nueva Entrada"
      description="Crea y publica una nueva entrada en el blog inmobiliario"
      breadcrumbs={breadcrumbs}
    >
      <BlogForm />
    </DashboardPageLayout>
  );
}
