/**
 * Unit tests for authentication server actions
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the auth module
jest.mock("@/lib/auth/auth", () => ({
	auth: {
		api: {
			signInEmail: jest.fn(),
			signUpEmail: jest.fn(),
			signOut: jest.fn(),
			forgetPassword: jest.fn(),
			resetPassword: jest.fn(),
			updateUser: jest.fn(),
			changePassword: jest.fn(),
			sendVerificationOTP: jest.fn(),
			verifyEmailOTP: jest.fn(),
			getSession: jest.fn(),
		},
	},
}));

// Mock headers
jest.mock("next/headers", () => ({
	headers: jest.fn().mockResolvedValue(new Headers()),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
	info: jest.fn(),
	warning: jest.fn(),
	error: jest.fn(),
}));

import { auth } from "@/lib/auth/auth";
import {
	changePassword,
	forgotPassword,
	getCurrentUser,
	resetPassword,
	signIn,
	signUp,
	updateUserProfile,
	verifyOTP,
} from "../auth";

describe("Authentication Server Actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("signIn", () => {
		it("should successfully sign in with valid credentials", async () => {
			const mockUser = {
				id: "1",
				email: "test@example.com",
				role: "user",
			};

			(auth.api.signInEmail as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.success).toBe(true);
			expect(result.data?.user).toEqual(mockUser);
			expect(result.data?.redirectUrl).toBe("/profile");
		});

		it("should return error for invalid credentials", async () => {
			(auth.api.signInEmail as jest.Mock).mockResolvedValue({
				user: null,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "wrongpassword",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Invalid credentials");
		});

		it("should validate email format", async () => {
			const result = await signIn({
				email: "invalid-email",
				password: "password123",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.email).toContain("Invalid email format");
		});

		it("should require email and password", async () => {
			const result = await signIn({
				email: "",
				password: "",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.email).toContain("Email is required");
			expect(result.errors?.password).toContain("Password is required");
		});
	});

	describe("signUp", () => {
		it("should successfully create new user account", async () => {
			const mockUser = {
				id: "1",
				email: "test@example.com",
				name: "Test User",
			};

			(auth.api.signUpEmail as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { ...mockUser, role: "user" },
			});

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.success).toBe(true);
			expect(result.data?.user).toEqual(mockUser);
			expect(result.data?.redirectUrl).toBe("/profile");
		});

		it("should validate password strength", async () => {
			const result = await signUp({
				email: "test@example.com",
				password: "123",
				name: "Test User",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.password).toContain(
				"Password must be at least 8 characters"
			);
		});

		it("should require all fields", async () => {
			const result = await signUp({
				email: "",
				password: "",
				name: "",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.email).toContain("Email is required");
			expect(result.errors?.password).toContain("Password is required");
			expect(result.errors?.name).toContain("Name is required");
		});
	});

	describe("forgotPassword", () => {
		it("should send password reset email", async () => {
			(auth.api.forgetPassword as jest.Mock).mockResolvedValue({});

			const result = await forgotPassword({
				email: "test@example.com",
			});

			expect(result.success).toBe(true);
			expect(auth.api.forgetPassword).toHaveBeenCalledWith({
				body: { email: "test@example.com" },
				headers: expect.any(Headers),
			});
		});

		it("should validate email format", async () => {
			const result = await forgotPassword({
				email: "invalid-email",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.email).toContain("Invalid email format");
		});

		it("should handle non-existent user gracefully", async () => {
			(auth.api.forgetPassword as jest.Mock).mockRejectedValue(
				new Error("User not found")
			);

			const result = await forgotPassword({
				email: "nonexistent@example.com",
			});

			// Should still return success for security
			expect(result.success).toBe(true);
		});
	});

	describe("resetPassword", () => {
		it("should reset password with valid token", async () => {
			(auth.api.resetPassword as jest.Mock).mockResolvedValue({});

			const result = await resetPassword({
				token: "valid-token",
				password: "newpassword123",
				confirmPassword: "newpassword123",
			});

			expect(result.success).toBe(true);
			expect(auth.api.resetPassword).toHaveBeenCalledWith({
				body: {
					token: "valid-token",
					newPassword: "newpassword123",
				},
				headers: expect.any(Headers),
			});
		});

		it("should validate password confirmation", async () => {
			const result = await resetPassword({
				token: "valid-token",
				password: "newpassword123",
				confirmPassword: "differentpassword",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.confirmPassword).toContain(
				"Passwords do not match"
			);
		});

		it("should validate password strength", async () => {
			const result = await resetPassword({
				token: "valid-token",
				password: "123",
				confirmPassword: "123",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.password).toContain(
				"Password must be at least 8 characters"
			);
		});
	});

	describe("updateUserProfile", () => {
		it("should update user profile successfully", async () => {
			const mockUser = {
				id: "1",
				email: "test@example.com",
				name: "Updated Name",
			};

			(auth.api.getSession as jest.Mock)
				.mockResolvedValueOnce({ user: mockUser })
				.mockResolvedValueOnce({ user: mockUser });

			(auth.api.updateUser as jest.Mock).mockResolvedValue({});

			const result = await updateUserProfile({
				name: "Updated Name",
				email: "updated@example.com",
			});

			expect(result.success).toBe(true);
			expect(auth.api.updateUser).toHaveBeenCalled();
		});

		it("should require authentication", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue(null);

			const result = await updateUserProfile({
				name: "Updated Name",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Not authenticated");
		});

		it("should validate email format", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { id: "1" },
			});

			const result = await updateUserProfile({
				email: "invalid-email",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.email).toContain("Invalid email format");
		});
	});

	describe("changePassword", () => {
		it("should change password successfully", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { id: "1" },
			});

			(auth.api.changePassword as jest.Mock).mockResolvedValue({});

			const result = await changePassword({
				currentPassword: "oldpassword",
				newPassword: "newpassword123",
				confirmPassword: "newpassword123",
			});

			expect(result.success).toBe(true);
			expect(auth.api.changePassword).toHaveBeenCalledWith({
				body: {
					currentPassword: "oldpassword",
					newPassword: "newpassword123",
				},
				headers: expect.any(Headers),
			});
		});

		it("should validate new password confirmation", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { id: "1" },
			});

			const result = await changePassword({
				currentPassword: "oldpassword",
				newPassword: "newpassword123",
				confirmPassword: "differentpassword",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.confirmPassword).toContain(
				"New passwords do not match"
			);
		});

		it("should prevent using same password", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: { id: "1" },
			});

			const result = await changePassword({
				currentPassword: "samepassword",
				newPassword: "samepassword",
				confirmPassword: "samepassword",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.newPassword).toContain(
				"New password must be different from current password"
			);
		});
	});

	describe("verifyOTP", () => {
		it("should verify OTP successfully", async () => {
			const mockUser = { id: "1", email: "test@example.com" };

			(auth.api.verifyEmailOTP as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const result = await verifyOTP({
				email: "test@example.com",
				otp: "123456",
			});

			expect(result.success).toBe(true);
			expect(auth.api.verifyEmailOTP).toHaveBeenCalledWith({
				body: { email: "test@example.com", otp: "123456" },
				headers: expect.any(Headers),
			});
		});

		it("should validate OTP format", async () => {
			const result = await verifyOTP({
				email: "test@example.com",
				otp: "123",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.otp).toContain("OTP code must be 6 digits");
		});

		it("should handle invalid OTP", async () => {
			(auth.api.verifyEmailOTP as jest.Mock).mockResolvedValue({
				user: null,
			});

			const result = await verifyOTP({
				email: "test@example.com",
				otp: "123456",
			});

			expect(result.success).toBe(false);
			expect(result.errors?.otp).toContain("Invalid or expired OTP code");
		});
	});

	describe("getCurrentUser", () => {
		it("should return current user when authenticated", async () => {
			const mockUser = {
				id: "1",
				email: "test@example.com",
				name: "Test User",
			};

			(auth.api.getSession as jest.Mock).mockResolvedValue({
				user: mockUser,
			});

			const result = await getCurrentUser();

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe("1");
			expect(result.data?.email).toBe("test@example.com");
		});

		it("should return null when not authenticated", async () => {
			(auth.api.getSession as jest.Mock).mockResolvedValue(null);

			const result = await getCurrentUser();

			expect(result.success).toBe(true);
			expect(result.data).toBeNull();
		});
	});
});
