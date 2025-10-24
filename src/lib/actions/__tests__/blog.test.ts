/**
 * Unit tests for blog server actions
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the database
jest.mock("@/lib/db", () => ({
	db: {
		insert: jest.fn(),
		update: jest.fn(),
		select: jest.fn(),
		delete: jest.fn(),
	},
}));

// Mock the auth module
jest.mock("@/lib/auth/auth", () => ({
	auth: {
		api: {
			getSession: jest.fn(),
		},
	},
}));

// Mock headers
jest.mock("next/headers", () => ({
	headers: jest.fn().mockResolvedValue(new Headers()),
}));

// Mock revalidatePath
jest.mock("next/cache", () => ({
	revalidatePath: jest.fn(),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
	generateSlug: jest.fn((title: string) =>
		title.toLowerCase().replace(/\s+/g, "-"),
	),
	calculateReadTime: jest.fn(() => 5),
}));

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
	createBlogPost,
	deleteBlogPost,
	getBlogPostById,
	getBlogPostBySlug,
	publishBlogPost,
	searchBlogPosts,
	unpublishBlogPost,
	updateBlogPost,
} from "../blog";

describe("Blog Server Actions", () => {
	const mockUser = {
		id: "user-123",
		email: "test@example.com",
		role: "user",
	};

	const mockBlogPost = {
		id: "blog-123",
		title: "Test Blog Post",
		content: "This is a test blog post content",
		excerpt: "Test excerpt",
		slug: "test-blog-post",
		category: "real-estate",
		tags: ["test", "blog"],
		coverImage: null,
		authorId: "user-123",
		readTime: 5,
		status: "draft",
		publishedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createBlogPost", () => {
		it("should create blog post successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([]),
			};

			const mockInsert = {
				values: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.insert as jest.Mock).mockReturnValue(mockInsert);

			const input = {
				title: "Test Blog Post",
				content: "This is a test blog post content",
				excerpt: "Test excerpt",
				category: "real-estate",
				tags: ["test", "blog"],
			};

			const result = await createBlogPost(input);

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("Test Blog Post");
			expect(mockInsert.values).toHaveBeenCalled();
			expect(mockInsert.returning).toHaveBeenCalled();
		});

		it("should require authentication", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue(null);

			const input = {
				title: "Test Blog Post",
				content: "This is a test blog post content",
				category: "real-estate",
			};

			const result = await createBlogPost(input);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized");
		});

		it("should handle duplicate slug", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([{ id: "existing-blog" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const input = {
				title: "Test Blog Post",
				content: "This is a test blog post content",
				category: "real-estate",
				slug: "existing-slug",
			};

			const result = await createBlogPost(input);

			expect(result.success).toBe(false);
			expect(result.error).toBe("A blog post with this slug already exists");
			expect(result.errors?.slug).toContain("Slug must be unique");
		});
	});

	describe("updateBlogPost", () => {
		it("should update blog post successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...mockBlogPost, title: "Updated Blog Post" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await updateBlogPost({
				id: "blog-123",
				title: "Updated Blog Post",
			});

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("Updated Blog Post");
		});

		it("should check blog post ownership", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await updateBlogPost({
				id: "blog-123",
				title: "Updated Blog Post",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to update this blog post");
		});

		it("should handle non-existent blog post", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await updateBlogPost({
				id: "non-existent",
				title: "Updated Blog Post",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Blog post not found");
		});
	});

	describe("deleteBlogPost", () => {
		it("should delete blog post successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			const mockDelete = {
				where: jest.fn().mockResolvedValue(undefined),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.delete as jest.Mock).mockReturnValue(mockDelete);

			const result = await deleteBlogPost("blog-123");

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe("blog-123");
		});

		it("should check blog post ownership before deletion", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await deleteBlogPost("blog-123");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to delete this blog post");
		});
	});

	describe("getBlogPostById", () => {
		it("should get blog post successfully", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await getBlogPostById("blog-123");

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe("blog-123");
		});

		it("should return error for non-existent blog post", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await getBlogPostById("non-existent");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Blog post not found");
		});
	});

	describe("getBlogPostBySlug", () => {
		it("should get blog post by slug successfully", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await getBlogPostBySlug("test-blog-post");

			expect(result.success).toBe(true);
			expect(result.data?.slug).toBe("test-blog-post");
		});
	});

	describe("searchBlogPosts", () => {
		it("should search blog posts with filters", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			const mockCount = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([{ total: 1 }]),
			};

			(db.select as jest.Mock)
				.mockReturnValueOnce(mockCount)
				.mockReturnValueOnce(mockSelect);

			const result = await searchBlogPosts({
				query: "test",
				category: "real-estate",
				status: "published",
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data?.posts).toHaveLength(1);
			expect(result.data?.total).toBe(1);
		});

		it("should handle empty search results", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockResolvedValue([]),
			};

			const mockCount = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([{ total: 0 }]),
			};

			(db.select as jest.Mock)
				.mockReturnValueOnce(mockCount)
				.mockReturnValueOnce(mockSelect);

			const result = await searchBlogPosts({
				query: "nonexistent",
			});

			expect(result.success).toBe(true);
			expect(result.data?.posts).toHaveLength(0);
			expect(result.data?.total).toBe(0);
		});
	});

	describe("publishBlogPost", () => {
		it("should publish blog post successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...mockBlogPost, status: "published" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await publishBlogPost({
				id: "blog-123",
			});

			expect(result.success).toBe(true);
			expect(result.data?.status).toBe("published");
		});

		it("should check blog post ownership before publishing", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockBlogPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await publishBlogPost({
				id: "blog-123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to publish this blog post");
		});

		it("should prevent publishing already published post", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const publishedPost = { ...mockBlogPost, status: "published" };
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([publishedPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await publishBlogPost({
				id: "blog-123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Blog post is already published");
		});

		it("should validate required fields for publishing", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const incompletePost = { ...mockBlogPost, title: "", content: "" };
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([incompletePost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await publishBlogPost({
				id: "blog-123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe(
				"Blog post must have title and content to be published",
			);
		});
	});

	describe("unpublishBlogPost", () => {
		it("should unpublish blog post successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const publishedPost = { ...mockBlogPost, status: "published" };
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([publishedPost]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...publishedPost, status: "draft" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await unpublishBlogPost("blog-123");

			expect(result.success).toBe(true);
			expect(result.data?.status).toBe("draft");
		});

		it("should check blog post ownership before unpublishing", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const publishedPost = { ...mockBlogPost, status: "published" };
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([publishedPost]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await unpublishBlogPost("blog-123");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to unpublish this blog post");
		});
	});
});
