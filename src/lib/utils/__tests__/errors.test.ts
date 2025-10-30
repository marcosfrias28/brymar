/**
 * Tests for error handling utilities
 */

import {
	AppError,
	errorResult,
	handleActionError,
	NotFoundError,
	successResult,
	ValidationError,
	validateEmail,
	validatePassword,
	validateRequired,
	withErrorHandling,
} from "../errors";

describe("Error Classes", () => {
	test("AppError should create error with correct properties", () => {
		const error = new AppError("Test error", "TEST_CODE", 400);

		expect(error.message).toBe("Test error");
		expect(error.code).toBe("TEST_CODE");
		expect(error.statusCode).toBe(400);
		expect(error.name).toBe("AppError");
	});

	test("ValidationError should include errors object", () => {
		const errors = { email: ["Invalid email"] };
		const error = new ValidationError("Validation failed", errors);

		expect(error.message).toBe("Validation failed");
		expect(error.code).toBe("VALIDATION_ERROR");
		expect(error.statusCode).toBe(400);
		expect(error.errors).toEqual(errors);
	});

	test("NotFoundError should format message correctly", () => {
		const error = new NotFoundError("User");

		expect(error.message).toBe("User not found");
		expect(error.code).toBe("NOT_FOUND");
		expect(error.statusCode).toBe(404);
	});
});

describe("Error Handling", () => {
	test("handleActionError should handle ValidationError", () => {
		const validationError = new ValidationError("Validation failed", {
			email: ["Invalid email"],
		});

		const result = handleActionError(validationError);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Validation failed");
		expect(result.errors).toEqual({ email: ["Invalid email"] });
	});

	test("handleActionError should handle AppError", () => {
		const appError = new AppError("Test error");

		const result = handleActionError(appError);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Test error");
		expect(result.errors).toBeUndefined();
	});

	test("handleActionError should handle unknown error", () => {
		const result = handleActionError("Unknown error");

		expect(result.success).toBe(false);
		expect(result.error).toBe("An unexpected error occurred");
	});
});

describe("Result Helpers", () => {
	test("successResult should create success result", () => {
		const data = { id: "123", name: "Test" };
		const result = successResult(data);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(data);
	});

	test("errorResult should create error result", () => {
		const result = errorResult("Test error", { field: ["Error"] });

		expect(result.success).toBe(false);
		expect(result.error).toBe("Test error");
		expect(result.errors).toEqual({ field: ["Error"] });
	});
});

describe("Validation Helpers", () => {
	test("validateRequired should pass with valid data", () => {
		const data = { name: "Test", email: "test@example.com" };

		expect(() => {
			validateRequired(data, ["name", "email"]);
		}).not.toThrow();
	});

	test("validateRequired should throw ValidationError for missing fields", () => {
		const data = { name: "Test" };

		expect(() => {
			validateRequired(data, ["name", "email"]);
		}).toThrow(ValidationError);
	});

	test("validateEmail should validate email format", () => {
		expect(validateEmail("test@example.com")).toBe(true);
		expect(validateEmail("invalid-email")).toBe(false);
		expect(validateEmail("")).toBe(false);
	});

	test("validatePassword should return errors for weak password", () => {
		const errors = validatePassword("weak");

		expect(errors).toContain("Password must be at least 8 characters long");
		expect(errors).toContain(
			"Password must contain at least one uppercase letter"
		);
		expect(errors).toContain("Password must contain at least one number");
	});

	test("validatePassword should return no errors for strong password", () => {
		const errors = validatePassword("StrongPass123");

		expect(errors).toHaveLength(0);
	});
});

describe("withErrorHandling", () => {
	test("should return success result for successful action", async () => {
		const action = async () => ({ id: "123", name: "Test" });

		const result = await withErrorHandling(action);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({ id: "123", name: "Test" });
	});

	test("should return error result for failed action", async () => {
		const action = async () => {
			throw new AppError("Test error");
		};

		const result = await withErrorHandling(action);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Test error");
	});
});
