'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/container/Container';
import {
    CreateBlogPostUseCase,
    GetBlogPostByIdUseCase,
    SearchBlogPostsUseCase,
    UpdateBlogPostUseCase,
    DeleteBlogPostUseCase,
    PublishBlogPostUseCase
} from '@/application/use-cases/content';
import {
    CreateBlogPostInput,
    GetBlogPostByIdInput,
    SearchBlogPostsInput,
    UpdateBlogPostInput,
    DeleteBlogPostInput,
    PublishBlogPostInput
} from '@/application/dto/content';
import type {
    CreateBlogPostOutput,
    GetBlogPostByIdOutput,
    UpdateBlogPostOutput,
    PublishBlogPostOutput
} from '@/application/dto/content';
import { toast } from 'sonner';

// Hook for managing multiple blog posts (listing, searching, creating)
export interface UseBlogReturn {
    blogPosts: GetBlogPostByIdOutput[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    currentPage: number;
    searchBlogPosts: (input: SearchBlogPostsInput) => Promise<void>;
    createBlogPost: (input: CreateBlogPostInput) => Promise<CreateBlogPostOutput | null>;
    refreshBlogPosts: () => Promise<void>;
    // State management
    setPage: (page: number) => void;
    setFilters: (filters: Partial<SearchBlogPostsInput>) => void;
}

export const useBlog = (_initialFilters?: Partial<SearchBlogPostsInput>): UseBlogReturn => {
    const [blogPosts, setBlogPosts] = useState<GetBlogPostByIdOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFiltersState] = useState<SearchBlogPostsInput>(
        SearchBlogPostsInput.create(initialFilters || {})
    );

    // Get use cases from container
    const searchBlogPostsUseCase = container.get<SearchBlogPostsUseCase>('SearchBlogPostsUseCase');
    const createBlogPostUseCase = container.get<CreateBlogPostUseCase>('CreateBlogPostUseCase');

    const searchBlogPosts = useCallback(async (input: SearchBlogPostsInput) => {
        try {
            setLoading(true);
            setError(null);

            const result = await searchBlogPostsUseCase.execute(input);

            setBlogPosts(result.getBlogPosts());
            setTotal(result.getTotal());
            setTotalPages(result.getTotalPages());
            setCurrentPage(result.getPage());
            setFiltersState(input);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al buscar posts del blog';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [searchBlogPostsUseCase]);

    const createBlogPost = useCallback(async (input: CreateBlogPostInput): Promise<CreateBlogPostOutput | null> => {
        try {
            setError(null);
            const result = await createBlogPostUseCase.execute(input);
            toast.success('Post del blog creado exitosamente');

            // Refresh the list
            await refreshBlogPosts();

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear post del blog';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        }
    }, [createBlogPostUseCase]);

    const refreshBlogPosts = useCallback(async () => {
        await searchBlogPosts(filters);
    }, [searchBlogPosts, filters]);

    const setPage = useCallback((page: number) => {
        const newFilters = SearchBlogPostsInput.create({ ...filters, page });
        searchBlogPosts(newFilters);
    }, [filters, searchBlogPosts]);

    const setFilters = useCallback((newFilters: Partial<SearchBlogPostsInput>) => {
        const updatedFilters = SearchBlogPostsInput.create({ ...filters, ...newFilters, page: 1 });
        searchBlogPosts(updatedFilters);
    }, [filters, searchBlogPosts]);

    // Initial load
    useEffect(() => {
        searchBlogPosts(filters);
    }, []); // Only run once on mount

    return {
        blogPosts,
        loading,
        error,
        total,
        totalPages,
        currentPage,
        searchBlogPosts,
        createBlogPost,
        refreshBlogPosts,
        setPage,
        setFilters,
    };
};

// Hook for managing a single blog post (viewing, editing, deleting)
export interface UseBlogPostReturn {
    blogPost: GetBlogPostByIdOutput | null;
    loading: boolean;
    error: string | null;
    updateBlogPost: (input: UpdateBlogPostInput) => Promise<UpdateBlogPostOutput | null>;
    deleteBlogPost: () => Promise<boolean>;
    publishBlogPost: () => Promise<PublishBlogPostOutput | null>;
    refreshBlogPost: () => Promise<void>;
}

export const useBlogPost = (blogPostId: string): UseBlogPostReturn => {
    const [blogPost, setBlogPost] = useState<GetBlogPostByIdOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get use cases from container
    const getBlogPostByIdUseCase = container.get<GetBlogPostByIdUseCase>('GetBlogPostByIdUseCase');
    const updateBlogPostUseCase = container.get<UpdateBlogPostUseCase>('UpdateBlogPostUseCase');
    const deleteBlogPostUseCase = container.get<DeleteBlogPostUseCase>('DeleteBlogPostUseCase');
    const publishBlogPostUseCase = container.get<PublishBlogPostUseCase>('PublishBlogPostUseCase');

    const fetchBlogPost = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const input = GetBlogPostByIdInput.fromId(blogPostId);
            const result = await getBlogPostByIdUseCase.execute(input);

            setBlogPost(result);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar post del blog';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [blogPostId, getBlogPostByIdUseCase]);

    const updateBlogPost = useCallback(async (input: UpdateBlogPostInput): Promise<UpdateBlogPostOutput | null> => {
        try {
            setError(null);
            const result = await updateBlogPostUseCase.execute(input);
            toast.success('Post del blog actualizado exitosamente');

            // Refresh the blog post
            await refreshBlogPost();

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar post del blog';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        }
    }, [updateBlogPostUseCase]);

    const deleteBlogPost = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);
            const input = DeleteBlogPostInput.fromId(blogPostId);
            const result = await deleteBlogPostUseCase.execute(input);

            if (result.isSuccess()) {
                toast.success('Post del blog eliminado exitosamente');
                return true;
            } else {
                toast.error(result.getMessage());
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar post del blog';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        }
    }, [blogPostId, deleteBlogPostUseCase]);

    const publishBlogPost = useCallback(async (): Promise<PublishBlogPostOutput | null> => {
        try {
            setError(null);
            const input = PublishBlogPostInput.create({ id: blogPostId });
            const result = await publishBlogPostUseCase.execute(input);
            toast.success('Post del blog publicado exitosamente');

            // Refresh the blog post
            await refreshBlogPost();

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al publicar post del blog';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        }
    }, [blogPostId, publishBlogPostUseCase]);

    const refreshBlogPost = useCallback(async () => {
        await fetchBlogPost();
    }, [fetchBlogPost]);

    // Initial load
    useEffect(() => {
        if (blogPostId) {
            fetchBlogPost();
        }
    }, [blogPostId, fetchBlogPost]);

    return {
        blogPost,
        loading,
        error,
        updateBlogPost,
        deleteBlogPost,
        publishBlogPost,
        refreshBlogPost,
    };
};

// Export aliases for backward compatibility
export const useBlogPosts = useBlog;