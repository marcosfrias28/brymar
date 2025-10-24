/**
 * Unit tests for property server actions
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the database
jest.mock("@/lib/db/drizzle", () => ({
	__esModule: true,
	default: {
		insert: jest.fn(),
		update: jest.fn(),
		select: jest.fn(),
		delete: jest.fn(),
		execute: jest.fn(),
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

// Mock crypto
jest.mock("crypto", () => ({
	randomUUID: jest.fn().mockReturnValue("test-uuid-123"),
}));

import { auth } from "@/lib/auth/auth";
import db from "@/lib/db/drizzle";
import {
	createProperty,
	createPropertyInquiry,
	deleteProperty,
	getPropertyById,
	publishProperty,
	searchProperties,
	updateProperty,
} from "../properties";

describe("Property Server Actions", () => {
	const mockUser = {
		id: "user-123",
		email: "test@example.com",
		role: "user",
	};

	const mockProperty = {
		id: "property-123",
		title: "Test Property",
		description: "A beautiful test property",
		price: 250000,
		currency: "USD",
		address: {
			street: "123 Test St",
			city: "Test City",
			state: "Test State",
			country: "Test Country",
		},
		type: "house",
		features: {
			bedrooms: 3,
			bathrooms: 2,
			area: 1500,
		},
		images: [],
		status: "draft",
		featured: false,
		userId: "user-123",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createProperty", () => {
		it("should create property successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockInsert = {
				values: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValue([mockProperty]),
			};

			(db.insert as jest.Mock).mockReturnValue(mockInsert);

			const input = {
				title: "Test Property",
				description: "A beautiful test property",
				price: 250000,
				currency: "USD",
				address: {
					street: "123 Test St",
					city: "Test City",
					state: "Test State",
					country: "Test Country",
				},
				type: "house" as const,
				features: {
					bedrooms: 3,
					bathrooms: 2,
					area: 1500,
				},
			};

			const result = await createProperty(input);

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("Test Property");
			expect(mockInsert.values).toHaveBeenCalled();
			expect(mockInsert.returning).toHaveBeenCalled();
		});

		it("should require authentication", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue(null);

			const input = {
				title: "Test Property",
				description: "A beautiful test property",
				price: 250000,
				currency: "USD",
				address: {
					street: "123 Test St",
					city: "Test City",
					state: "Test State",
					country: "Test Country",
				},
				type: "house" as const,
				features: {
					bedrooms: 3,
					bathrooms: 2,
					area: 1500,
				},
			};

			const result = await createProperty(input);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized");
		});

		it("should handle database errors", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockInsert = {
				values: jest.fn().mockReturnThis(),
				returning: jest.fn().mockRejectedValue(new Error("Database error")),
			};

			(db.insert as jest.Mock).mockReturnValue(mockInsert);

			const input = {
				title: "Test Property",
				description: "A beautiful test property",
				price: 250000,
				currency: "USD",
				address: {
					street: "123 Test St",
					city: "Test City",
					state: "Test State",
					country: "Test Country",
				},
				type: "house" as const,
				features: {
					bedrooms: 3,
					bathrooms: 2,
					area: 1500,
				},
			};

			const result = await createProperty(input);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe("updateProperty", () => {
		it("should update property successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...mockProperty, title: "Updated Property" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await updateProperty({
				id: "property-123",
				title: "Updated Property",
			});

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("Updated Property");
		});

		it("should check property ownership", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await updateProperty({
				id: "property-123",
				title: "Updated Property",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to update this property");
		});

		it("should allow admin to update any property", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user", role: "admin" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...mockProperty, title: "Updated Property" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await updateProperty({
				id: "property-123",
				title: "Updated Property",
			});

			expect(result.success).toBe(true);
		});
	});

	describe("getPropertyById", () => {
		it("should get property successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockInsert = {
				values: jest.fn().mockReturnThis(),
				catch: jest.fn().mockResolvedValue(undefined),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.insert as jest.Mock).mockReturnValue(mockInsert);

			const result = await getPropertyById("property-123");

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe("property-123");
		});

		it("should return error for non-existent property", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await getPropertyById("non-existent");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Property not found");
		});
	});

	describe("searchProperties", () => {
		it("should search properties with filters", async () => {
			const mockExecuteResult = {
				rows: [mockProperty],
			};

			const mockCountResult = {
				rows: [{ count: 1 }],
			};

			(db.execute as jest.Mock)
				.mockResolvedValueOnce(mockExecuteResult)
				.mockResolvedValueOnce(mockCountResult);

			const result = await searchProperties({
				minPrice: 200000,
				maxPrice: 300000,
				propertyTypes: ["house"],
				location: "Test City",
			});

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(1);
			expect(result.data?.total).toBe(1);
		});

		it("should handle empty search results", async () => {
			const mockExecuteResult = {
				rows: [],
			};

			const mockCountResult = {
				rows: [{ count: 0 }],
			};

			(db.execute as jest.Mock)
				.mockResolvedValueOnce(mockExecuteResult)
				.mockResolvedValueOnce(mockCountResult);

			const result = await searchProperties({
				minPrice: 1000000,
			});

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(0);
			expect(result.data?.total).toBe(0);
		});
	});

	describe("publishProperty", () => {
		it("should publish property successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockUpdate = {
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValue([{ ...mockProperty, status: "published" }]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.update as jest.Mock).mockReturnValue(mockUpdate);

			const result = await publishProperty({
				id: "property-123",
			});

			expect(result.success).toBe(true);
			expect(result.data?.status).toBe("published");
		});

		it("should check property ownership before publishing", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await publishProperty({
				id: "property-123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to publish this property");
		});
	});

	describe("deleteProperty", () => {
		it("should delete property successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockDelete = {
				where: jest.fn().mockResolvedValue(undefined),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.delete as jest.Mock).mockReturnValue(mockDelete);

			const result = await deleteProperty("property-123");

			expect(result.success).toBe(true);
		});

		it("should check property ownership before deletion", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, id: "different-user" },
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await deleteProperty("property-123");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized to delete this property");
		});
	});

	describe("createPropertyInquiry", () => {
		it("should create inquiry successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([mockProperty]),
			};

			const mockInsert = {
				values: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValue([
					{
						id: "inquiry-123",
						propertyId: "property-123",
						name: "John Doe",
						email: "john@example.com",
						message: "Interested in this property",
					},
				]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);
			(db.insert as jest.Mock).mockReturnValue(mockInsert);

			const result = await createPropertyInquiry({
				propertyId: "property-123",
				name: "John Doe",
				email: "john@example.com",
				message: "Interested in this property",
			});

			expect(result.success).toBe(true);
			expect(result.data?.name).toBe("John Doe");
		});

		it("should handle non-existent property", async () => {
			const mockSelect = {
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue([]),
			};

			(db.select as jest.Mock).mockReturnValue(mockSelect);

			const result = await createPropertyInquiry({
				propertyId: "non-existent",
				name: "John Doe",
				email: "john@example.com",
				message: "Interested in this property",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Property not found");
		});
	});
});
