"use client";

import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Clock,
	Edit3,
	Eye,
	Home,
	Save,
	Trash2,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useBlogPost,
	useDeleteBlogPost,
	useUpdateBlogPost,
} from "@/hooks/use-blog-posts";
import type { BlogPost } from "@/lib/types/blog";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function BlogDetailPage() {
	const params = useParams();
	const _router = useRouter();

	// Always call hooks before any early return
	const coverImageId = useId();
	const titleId = useId();
	const authorId = useId();
	const publishedDateId = useId();
	const readTimeId = useId();
	const {
		data: blogPost,
		isLoading: loading,
		error,
	} = useBlogPost(params?.id as string);
	const updateMutation = useUpdateBlogPost();
	const deleteMutation = useDeleteBlogPost();
	const [isEditing, setIsEditing] = useState(false);
	const [editedPost, setEditedPost] = useState<Partial<BlogPost> | null>(null);

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

	// Check if params and params.id exist after hooks
	if (!params || !params.id) {
		return (
			<DashboardPageLayout
				title="Error"
				description="ID de blog no encontrado"
				breadcrumbs={breadcrumbs}
			>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-foreground mb-2">
							ID de blog no válido
						</h2>
						<p className="text-muted-foreground mb-4">
							No se pudo encontrar el blog solicitado
						</p>
						<Button asChild className={secondaryColorClasses.focusRing}>
							<Link href="/dashboard/blog">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Volver al Blog
							</Link>
						</Button>
					</div>
				</div>
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
							{error?.message ||
								"El post que buscas no existe o ha sido eliminado."}
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
			const input = {
				id: blogPost.id,
				title: editedPost.title || blogPost.title,
				content: editedPost.content || blogPost.content,
				category: editedPost.category || blogPost.category,
				excerpt: editedPost.excerpt || blogPost.excerpt || undefined,
				tags: (editedPost.tags || blogPost.tags) as string[],
			};

			updateMutation.mutate(input, {
				onSuccess: () => {
					setIsEditing(false);
				},
			});
		}
	};

	// useEffect duplicato rimosso

	const handleCancel = () => {
		setEditedPost({ ...blogPost });
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
			if (blogPost?.id) {
				deleteMutation.mutate(blogPost.id);
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
							secondaryColorClasses.focusRing,
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
							: secondaryColorClasses.badge,
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
										<Label htmlFor={coverImageId}>URL de Imagen</Label>
										<Input
											id={coverImageId}
											value=""
											disabled
											placeholder="Image functionality not implemented"
										/>
									</div>
									<div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
										<Image
											src="/placeholder.svg"
											alt="Vista previa"
											fill
											className="object-cover"
										/>
									</div>
								</div>
							) : (
								<div className="aspect-video rounded-lg overflow-hidden relative">
									<Image
										src="/placeholder.svg"
										alt={currentData.title || "Blog post cover"}
										fill
										className="object-cover"
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
								<div className="prose prose-lg max-w-none">
									{/* Content is sanitized with DOMPurify before rendering to prevent XSS attacks */}
									<div
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(currentData.content || ""),
										}}
									/>
								</div>
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
										<Label htmlFor={titleId}>Título</Label>
										<Input
											id={titleId}
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
													| "lifestyle",
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
										<span>{currentData.authorId || "Unknown Author"}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-blackCoral">
										<Calendar className="h-4 w-4" />
										<span>
											{new Date(
												currentData.createdAt || "",
											).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-blackCoral">
										<Clock className="h-4 w-4" />
										<span>{currentData.readTime} min de lectura</span>
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
										<Label htmlFor={authorId}>Autor</Label>
										<Input
											id={authorId}
											value={editedPost?.authorId || ""}
											onChange={(e) =>
												editedPost &&
												setEditedPost({
													...editedPost,
													authorId: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor={publishedDateId}>
											Fecha de Publicación
										</Label>
										<Input
											id={publishedDateId}
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
										<Label htmlFor={readTimeId}>Tiempo de Lectura (min)</Label>
										<Input
											id={readTimeId}
											type="number"
											value={editedPost?.readTime || 0}
											onChange={(e) =>
												editedPost &&
												setEditedPost({
													...editedPost,
													readTime: Number(e.target.value),
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
												currentData.createdAt || "",
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
