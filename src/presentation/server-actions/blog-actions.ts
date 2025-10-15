'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
import { ActionState } from '@/lib/validations';

/**
 * Create a new blog post
 */
export async function createBlogPost(formData: FormData): Promise<ActionState> {
    try {
        const createBlogPostUseCase = container.get<CreateBlogPostUseCase>('CreateBlogPostUseCase');

        const input = CreateBlogPostInput.fromFormData(formData);
        const result = await createBlogPostUseCase.execute(input);

        revalidatePath('/dashboard/blog');

        return {
            success: true,
            message: 'Post del blog creado exitosamente',
            data: JSON.parse(result.toJSON())
        };

    } catch (error) {
        console.error('Error creating blog post:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al crear post del blog',
            error: error instanceof Error ? error.message : 'Error al crear post del blog'
        };
    }
}

/**
 * Get a blog post by ID
 */
export async function getBlogPostById(id: string): Promise<ActionState> {
    try {
        const getBlogPostByIdUseCase = container.get<GetBlogPostByIdUseCase>('GetBlogPostByIdUseCase');

        const input = GetBlogPostByIdInput.fromId(id);
        const result = await getBlogPostByIdUseCase.execute(input);

        return {
            success: true,
            message: 'Post del blog obtenido exitosamente',
            data: JSON.parse(result.toJSON())
        };

    } catch (error) {
        console.error('Error getting blog post:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al obtener post del blog',
            error: error instanceof Error ? error.message : 'Error al obtener post del blog'
        };
    }
}

/**
 * Search blog posts with filters and pagination
 */
export async function searchBlogPosts(searchParams: URLSearchParams): Promise<ActionState> {
    try {
        const searchBlogPostsUseCase = container.get<SearchBlogPostsUseCase>('SearchBlogPostsUseCase');

        const input = SearchBlogPostsInput.fromQuery(searchParams);
        const result = await searchBlogPostsUseCase.execute(input);

        return {
            success: true,
            message: 'Posts del blog obtenidos exitosamente',
            data: JSON.parse(result.toJSON())
        };

    } catch (error) {
        console.error('Error searching blog posts:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al buscar posts del blog',
            error: error instanceof Error ? error.message : 'Error al buscar posts del blog'
        };
    }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(formData: FormData): Promise<ActionState<{ id: string }>> {
    try {
        const updateBlogPostUseCase = container.get<UpdateBlogPostUseCase>('UpdateBlogPostUseCase');

        const input = UpdateBlogPostInput.fromFormData(formData);
        await updateBlogPostUseCase.execute(input);

        revalidatePath('/dashboard/blog');
        revalidatePath(`/dashboard/blog/${input.id}`);

        return {
            success: true,
            message: 'Post del blog actualizado exitosamente',
            data: { id: input.id }
        };

    } catch (error) {
        console.error('Error updating blog post:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al actualizar post del blog',
            error: error instanceof Error ? error.message : 'Error al actualizar post del blog'
        };
    }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<ActionState<{ id: string }>> {
    try {
        const deleteBlogPostUseCase = container.get<DeleteBlogPostUseCase>('DeleteBlogPostUseCase');

        const input = DeleteBlogPostInput.fromId(id);
        const result = await deleteBlogPostUseCase.execute(input);

        if (result.isSuccess()) {
            revalidatePath('/dashboard/blog');

            return {
                success: true,
                message: result.getMessage(),
                data: { id }
            };
        } else {
            return {
                success: false,
                message: result.getMessage(),
                error: result.getMessage()
            };
        }

    } catch (error) {
        console.error('Error deleting blog post:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al eliminar post del blog',
            error: error instanceof Error ? error.message : 'Error al eliminar post del blog'
        };
    }
}

/**
 * Publish a blog post
 */
export async function publishBlogPost(id: string): Promise<ActionState> {
    try {
        const publishBlogPostUseCase = container.get<PublishBlogPostUseCase>('PublishBlogPostUseCase');

        const input = PublishBlogPostInput.create({ id });
        const result = await publishBlogPostUseCase.execute(input);

        revalidatePath('/dashboard/blog');
        revalidatePath(`/dashboard/blog/${id}`);

        return {
            success: true,
            message: 'Post del blog publicado exitosamente',
            data: JSON.parse(result.toJSON())
        };

    } catch (error) {
        console.error('Error publishing blog post:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al publicar post del blog',
            error: error instanceof Error ? error.message : 'Error al publicar post del blog'
        };
    }
}

/**
 * Create blog post and redirect to list
 */
export async function createBlogPostAndRedirect(formData: FormData) {
    const result = await createBlogPost(formData);

    if (result.success) {
        redirect('/dashboard/blog');
    } else {
        throw new Error(result.message);
    }
}

/**
 * Update blog post and redirect to detail
 */
export async function updateBlogPostAndRedirect(formData: FormData) {
    const result = await updateBlogPost(formData);

    if (result.success && result.data) {
        redirect(`/dashboard/blog/${result.data.id}`);
    } else {
        throw new Error(result.message);
    }
}

/**
 * Delete blog post and redirect to list
 */
export async function deleteBlogPostAndRedirect(id: string) {
    const result = await deleteBlogPost(id);

    if (result.success) {
        redirect('/dashboard/blog');
    } else {
        throw new Error(result.message);
    }
}