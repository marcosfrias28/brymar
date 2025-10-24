/**
 * Blog posts hooks for state management
 * Replaces complex service layers with hook-based state management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	createBlogPost,
	deleteBlogPost,
	getBlogPostById,
	getBlogPostBySlug,
	getBlogPostsByCategory,
	getFeaturedBlogPosts,
	getRecentBlogPosts,
	publishBlogPost,
	searchBlogPosts,
	unpublishBlogPost,
	updateBlogPost,
} from "@/lib/actions/blog";
import type {
	BlogPost,
	BlogSearchFilters,
	CreateBlogPostInput,
	UpdateBlogPostInput,
} from "@/lib/types/blog";

/**
 * Hook for searching and listing blog posts
 */
export function useBlogPosts(filters?: BlogSearchFilters) {
	return useQuery({
		queryKey: ["blog-posts", filters],
		queryFn: async () => {
			const result = await searchBlogPosts(filters);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for getting a single blog post by ID
 */
export function useBlogPost(id: string | null) {
	return useQuery({
		queryKey: ["blog-post", id],
		queryFn: async () => {
			if (!id) return null;
			const result = await getBlogPostById(id);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for getting a single blog post by slug
 */
export function useBlogPostBySlug(slug: string | null) {
	return useQuery({
		queryKey: ["blog-post-slug", slug],
		queryFn: async () => {
			if (!slug) return null;
			const result = await getBlogPostBySlug(slug);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!slug,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for getting blog posts by category
 */
export function useBlogPostsByCategory(
	category: string,
	page: number = 1,
	limit: number = 12,
) {
	return useQuery({
		queryKey: ["blog-posts-category", category, page, limit],
		queryFn: async () => {
			const result = await getBlogPostsByCategory(category, page, limit);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for getting recent blog posts
 */
export function useRecentBlogPosts(limit: number = 5) {
	return useQuery({
		queryKey: ["recent-blog-posts", limit],
		queryFn: async () => {
			const result = await getRecentBlogPosts(limit);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for getting featured blog posts
 */
export function useFeaturedBlogPosts(limit: number = 3) {
	return useQuery({
		queryKey: ["featured-blog-posts", limit],
		queryFn: async () => {
			const result = await getFeaturedBlogPosts(limit);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 15 * 60 * 1000, // 15 minutes
	});
}

/**
 * Hook for creating a new blog post
 */
export function useCreateBlogPost() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: createBlogPost,
		onSuccess: (result) => {
			if (result.success) {
				toast.success("Blog post created successfully");
				queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
				router.push(`/dashboard/blog/${result.data?.id}/edit`);
			} else {
				toast.error(result.error || "Failed to create blog post");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create blog post");
		},
	});
}

/**
 * Hook for updating a blog post
 */
export function useUpdateBlogPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateBlogPost,
		onSuccess: (result, variables) => {
			if (result.success) {
				toast.success("Blog post updated successfully");
				queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
				queryClient.invalidateQueries({
					queryKey: ["blog-post", variables.id],
				});
				queryClient.invalidateQueries({ queryKey: ["blog-post-slug"] });
			} else {
				toast.error(result.error || "Failed to update blog post");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update blog post");
		},
	});
}

/**
 * Hook for deleting a blog post
 */
export function useDeleteBlogPost() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: deleteBlogPost,
		onSuccess: (result) => {
			if (result.success) {
				toast.success("Blog post deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
				router.push("/dashboard/blog");
			} else {
				toast.error(result.error || "Failed to delete blog post");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete blog post");
		},
	});
}

/**
 * Hook for publishing a blog post
 */
export function usePublishBlogPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: publishBlogPost,
		onSuccess: (result, variables) => {
			if (result.success) {
				toast.success("Blog post published successfully");
				queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
				queryClient.invalidateQueries({
					queryKey: ["blog-post", variables.id],
				});
				queryClient.invalidateQueries({ queryKey: ["blog-post-slug"] });
				queryClient.invalidateQueries({ queryKey: ["recent-blog-posts"] });
				queryClient.invalidateQueries({ queryKey: ["featured-blog-posts"] });
			} else {
				toast.error(result.error || "Failed to publish blog post");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to publish blog post");
		},
	});
}

/**
 * Hook for unpublishing a blog post
 */
export function useUnpublishBlogPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unpublishBlogPost,
		onSuccess: (result, id) => {
			if (result.success) {
				toast.success("Blog post unpublished successfully");
				queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
				queryClient.invalidateQueries({ queryKey: ["blog-post", id] });
				queryClient.invalidateQueries({ queryKey: ["blog-post-slug"] });
				queryClient.invalidateQueries({ queryKey: ["recent-blog-posts"] });
				queryClient.invalidateQueries({ queryKey: ["featured-blog-posts"] });
			} else {
				toast.error(result.error || "Failed to unpublish blog post");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unpublish blog post");
		},
	});
}

/**
 * Hook for optimistic blog post updates (for better UX)
 */
export function useOptimisticBlogPost(initialPost: BlogPost | null) {
	const queryClient = useQueryClient();

	const updateOptimistic = (updates: Partial<BlogPost>) => {
		if (!initialPost) return;

		const queryKey = ["blog-post", initialPost.id];
		queryClient.setQueryData(queryKey, (old: BlogPost | undefined) => {
			if (!old) return old;
			return { ...old, ...updates };
		});
	};

	return { updateOptimistic };
}

/**
 * Hook for blog post form state management
 */
export function useBlogPostForm(_initialData?: Partial<CreateBlogPostInput>) {
	const createMutation = useCreateBlogPost();
	const updateMutation = useUpdateBlogPost();

	const handleSubmit = async (
		data: CreateBlogPostInput | UpdateBlogPostInput,
	) => {
		if ("id" in data) {
			return updateMutation.mutateAsync(data);
		} else {
			return createMutation.mutateAsync(data);
		}
	};

	return {
		handleSubmit,
		isLoading: createMutation.isPending || updateMutation.isPending,
		error: createMutation.error || updateMutation.error,
	};
}
