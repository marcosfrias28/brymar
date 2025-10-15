"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Eye,
  Trash2,
  Calendar,
  User,
  Clock,
  Home,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

import { useBlogPost } from "@/presentation/hooks/use-blog";
import type { GetBlogPostByIdOutput } from "@/application/dto/content";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Sempre chiamare gli hooks prima di qualsiasi early return
  const {
    blogPost,
    loading,
    error,
    updateBlogPost,
    deleteBlogPost,
    refreshBlogPost,
  } = useBlogPost(params?.id as string);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] =
    useState<Partial<GetBlogPostByIdOutput> | null>(null);

  useEffect(() => {
    if (blogPost) {
      setEditedPost({ ...blogPost });
    }
  }, [blogPost]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Blog", href: "/dashboard/blog", icon: BookOpen },
    { label: blogPost?.title || "Post", icon: Edit3 },
  ];

  // Verificar que params y params.id existan dopo gli hooks
  if (!params || !params.id) {
    return (
      <DashboardPageLayout
        title="Error"
        description="ID de blog no encontrado"
        breadcrumbs={breadcrumbs}
      >
        <div>Error: ID de blog no encontrado</div>
      </DashboardPageLayout>
    );
  }

  if (loading) {
    return (
      <DashboardPageLayout
        title="Cargando..."
        description="Cargando información del post"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Cargando...
            </h2>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !blogPost) {
    return (
      <DashboardPageLayout
        title="Post no encontrado"
        description="El post que buscas no existe"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Post no encontrado
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "El post que buscas no existe o ha sido eliminado."}
            </p>
            <Button asChild className={secondaryColorClasses.focusRing}>
              <Link href="/dashboard/blog">Volver al Blog</Link>
            </Button>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleSave = async () => {
    if (editedPost && blogPost) {
      const { UpdateBlogPostInput } = await import("@/application/dto/content");

      const input = UpdateBlogPostInput.create({
        id: blogPost.getId().value,
        title: editedPost.title || blogPost.title,
        content: editedPost.content || blogPost.content,
        author: editedPost.author || blogPost.author,
        category: (editedPost.category || blogPost.category) as
          | "market-analysis"
          | "investment-tips"
          | "property-news"
          | "legal-advice"
          | "lifestyle",
      });

      const result = await updateBlogPost(input);
      if (result) {
        setIsEditing(false);
      }
    }
  };

  // useEffect duplicato rimosso

  const handleCancel = () => {
    setEditedPost({ ...blogPost });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      const success = await deleteBlogPost();
      if (success) {
        router.push("/dashboard/blog");
      }
    }
  };

  const currentData = isEditing ? editedPost : blogPost;

  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
        </div>
      </div>
    );
  }

  const actions = (
    <div className="flex gap-2">
      {!isEditing ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className={secondaryColorClasses.focusRing}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={secondaryColorClasses.focusRing}
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className={secondaryColorClasses.focusRing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className={cn(
              "bg-primary hover:bg-primary/90",
              secondaryColorClasses.focusRing
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </>
      )}
    </div>
  );

  return (
    <DashboardPageLayout
      title={isEditing ? "Editando Post" : currentData.title || "Post"}
      description={
        isEditing
          ? "Editando información del post"
          : "Detalles del post del blog"
      }
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-6">
        <Badge
          variant={currentData.status === "published" ? "default" : "secondary"}
          className={cn(
            currentData.status === "published"
              ? "bg-green-600 text-white"
              : secondaryColorClasses.badge
          )}
        >
          {currentData.status === "published" ? "Publicado" : "Borrador"}
        </Badge>
        <Badge
          variant="outline"
          className={secondaryColorClasses.badgeWithBorder}
        >
          {currentData.category}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cover Image */}
          <Card
            className={cn("border-border", secondaryColorClasses.cardHover)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coverImage">URL de Imagen</Label>
                    <Input
                      id="coverImage"
                      value=""
                      disabled
                      placeholder="Image functionality not implemented"
                    />
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src="/placeholder.svg"
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt={currentData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card
            className={cn("border-border", secondaryColorClasses.cardHover)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Contenido del Post</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <RichTextEditor
                  content={editedPost?.content || ""}
                  onChange={(content) =>
                    editedPost && setEditedPost({ ...editedPost, content })
                  }
                  placeholder="Escribe el contenido del post..."
                />
              ) : (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: currentData.content || "",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card
            className={cn("border-border", secondaryColorClasses.cardHover)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Información del Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editedPost?.title || ""}
                      onChange={(e) =>
                        editedPost &&
                        setEditedPost({ ...editedPost, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={editedPost?.status || ""}
                      onValueChange={(value: "draft" | "published") =>
                        editedPost &&
                        setEditedPost({ ...editedPost, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={editedPost?.category || ""}
                      onValueChange={(
                        value:
                          | "market-analysis"
                          | "investment-tips"
                          | "property-news"
                          | "legal-advice"
                          | "lifestyle"
                      ) =>
                        editedPost &&
                        setEditedPost({ ...editedPost, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inversiones">Inversiones</SelectItem>
                        <SelectItem value="mercado">Mercado</SelectItem>
                        <SelectItem value="consejos">Consejos</SelectItem>
                        <SelectItem value="desarrollos">Desarrollos</SelectItem>
                        <SelectItem value="noticias">Noticias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <User className="h-4 w-4" />
                    <span>{currentData.author || "Unknown Author"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        currentData.createdAt || ""
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <Clock className="h-4 w-4" />
                    <span>{currentData.readingTime} min de lectura</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Author & Publishing */}
          <Card
            className={cn("border-border", secondaryColorClasses.cardHover)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="author">Autor</Label>
                    <Input
                      id="author"
                      value={editedPost?.author || ""}
                      onChange={(e) =>
                        editedPost &&
                        setEditedPost({
                          ...editedPost,
                          author: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishedDate">Fecha de Publicación</Label>
                    <Input
                      id="publishedDate"
                      type="date"
                      value={
                        editedPost?.createdAt
                          ? new Date(editedPost.createdAt)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        editedPost &&
                        setEditedPost({
                          ...editedPost,
                          createdAt: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="readTime">Tiempo de Lectura (min)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      value={editedPost?.readingTime || 0}
                      onChange={(e) =>
                        editedPost &&
                        setEditedPost({
                          ...editedPost,
                          readingTime: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">
                      Fecha de creación
                    </Label>
                    <p className="text-sm text-blackCoral leading-relaxed">
                      {new Date(
                        currentData.createdAt || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card
            className={cn("border-border", secondaryColorClasses.cardHover)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-blackCoral">
                    ID del Post
                  </Label>
                  <p className="text-blackCoral font-mono">{currentData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
