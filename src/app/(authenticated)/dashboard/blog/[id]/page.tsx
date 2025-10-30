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
	if (!params?.id) {
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
				description="ID de blog no encontrado"
				title="Error"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-foreground text-xl">
							ID de blog no válido
						</h2>
						<p className="mb-4 text-muted-foreground">
							No se pudo encontrar el blog solicitado
						</p>
						<Button asChild className={secondaryColorClasses.focusRing}>
							<Link href="/dashboard/blog">
								<ArrowLeft className="mr-2 h-4 w-4" />
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
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/blog">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver al Blog
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Cargando información del post"
				title="Cargando..."
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-foreground text-xl">
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
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/blog">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver al Blog
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="El post que buscas no existe"
				title="Post no encontrado"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-foreground text-xl">
							Post no encontrado
						</h2>
						<p className="mb-4 text-muted-foreground">
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
		if (
			confirm("¿Estás seguro de que quieres eliminar este post?") &&
			blogPost?.id
		) {
			deleteMutation.mutate(blogPost.id);
		}
	};

	const currentData = isEditing ? editedPost : blogPost;

	if (!currentData) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">Cargando...</h2>
				</div>
			</div>
		);
	}

	const actions = (
		<div className="flex gap-2">
			{isEditing ? (
				<>
					<Button
						className={secondaryColorClasses.focusRing}
						onClick={handleCancel}
						size="sm"
						variant="outline"
					>
						<X className="mr-2 h-4 w-4" />
						Cancelar
					</Button>
					<Button
						className={cn(
							"bg-primary hover:bg-primary/90",
							secondaryColorClasses.focusRing
						)}
						onClick={handleSave}
						size="sm"
					>
						<Save className="mr-2 h-4 w-4" />
						Guardar
					</Button>
				</>
			) : (
				<>
					<Button
						className={secondaryColorClasses.focusRing}
						onClick={() => setIsEditing(true)}
						size="sm"
						variant="outline"
					>
						<Edit3 className="mr-2 h-4 w-4" />
						Editar
					</Button>
					<Button
						className={secondaryColorClasses.focusRing}
						size="sm"
						variant="outline"
					>
						<Eye className="mr-2 h-4 w-4" />
						Vista Previa
					</Button>
					<Button onClick={handleDelete} size="sm" variant="destructive">
						<Trash2 className="mr-2 h-4 w-4" />
						Eliminar
					</Button>
				</>
			)}
		</div>
	);

	return (
		<DashboardPageLayout
			actions={actions}
			breadcrumbs={breadcrumbs}
			description={
				isEditing
					? "Editando información del post"
					: "Detalles del post del blog"
			}
			title={isEditing ? "Editando Post" : currentData.title || "Post"}
		>
			{/* Status Badges */}
			<div className="mb-6 flex items-center gap-2">
				<Badge
					className={cn(
						currentData.status === "published"
							? "bg-green-600 text-white"
							: secondaryColorClasses.badge
					)}
					variant={currentData.status === "published" ? "default" : "secondary"}
				>
					{currentData.status === "published" ? "Publicado" : "Borrador"}
				</Badge>
				<Badge
					className={secondaryColorClasses.badgeWithBorder}
					variant="outline"
				>
					{currentData.category}
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-3">
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
											disabled
											id={coverImageId}
											placeholder="Image functionality not implemented"
											value=""
										/>
									</div>
									<div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
										<Image
											alt="Vista previa"
											className="object-cover"
											fill
											src="/placeholder.svg"
										/>
									</div>
								</div>
							) : (
								<div className="relative aspect-video overflow-hidden rounded-lg">
									<Image
										alt={currentData.title || "Blog post cover"}
										className="object-cover"
										fill
										src="/placeholder.svg"
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
											onChange={(e) =>
												editedPost &&
												setEditedPost({ ...editedPost, title: e.target.value })
											}
											value={editedPost?.title || ""}
										/>
									</div>

									<div>
										<Label htmlFor="status">Estado</Label>
										<Select
											onValueChange={(value: "draft" | "published") =>
												editedPost &&
												setEditedPost({ ...editedPost, status: value })
											}
											value={editedPost?.status || ""}
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
											value={editedPost?.category || ""}
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
									<div className="flex items-center gap-2 text-blackCoral text-sm">
										<User className="h-4 w-4" />
										<span>{currentData.authorId || "Unknown Author"}</span>
									</div>
									<div className="flex items-center gap-2 text-blackCoral text-sm">
										<Calendar className="h-4 w-4" />
										<span>
											{new Date(
												currentData.createdAt || ""
											).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center gap-2 text-blackCoral text-sm">
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
											onChange={(e) =>
												editedPost &&
												setEditedPost({
													...editedPost,
													authorId: e.target.value,
												})
											}
											value={editedPost?.authorId || ""}
										/>
									</div>
									<div>
										<Label htmlFor={publishedDateId}>
											Fecha de Publicación
										</Label>
										<Input
											id={publishedDateId}
											onChange={(e) =>
												editedPost &&
												setEditedPost({
													...editedPost,
													createdAt: new Date(e.target.value),
												})
											}
											type="date"
											value={
												editedPost?.createdAt
													? new Date(editedPost.createdAt)
															.toISOString()
															.split("T")[0]
													: ""
											}
										/>
									</div>
									<div>
										<Label htmlFor={readTimeId}>Tiempo de Lectura (min)</Label>
										<Input
											id={readTimeId}
											onChange={(e) =>
												editedPost &&
												setEditedPost({
													...editedPost,
													readTime: Number(e.target.value),
												})
											}
											type="number"
											value={editedPost?.readTime || 0}
										/>
									</div>
								</>
							) : (
								<div className="space-y-2">
									<div>
										<Label className="font-medium text-blackCoral text-sm">
											Fecha de creación
										</Label>
										<p className="text-blackCoral text-sm leading-relaxed">
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
									<Label className="font-medium text-blackCoral text-sm">
										ID del Post
									</Label>
									<p className="font-mono text-blackCoral">{currentData.id}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
