import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { z } from 'zod';
import {
  ActionState,
  createValidatedAction,
  handleAPIError,
  createSuccessResponse,
  createErrorResponse,
  parseFormData
} from '../validations';

// Mock FormData for Node.js environment
global.FormData = class FormData {
  private data: Map<string, any> = new Map();

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key) || null;
  }

  entries() {
    return this.data.entries();
  }

  has(key: string) {
    return this.data.has(key);
  }
} as any;

// Mock File for testing
global.File = class File {
  name: string;
  type: string;
  size: number;

  constructor(_chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.type = options.type || '';
    this.size = options.size || 0;
  }
} as any;

// Mock the getUser function for testing
jest.mock('../actions/auth-actions', () => ({
  getUser: jest.fn().mockResolvedValue({ id: 'test-user', email: 'test@example.com' } as never)
}));

describe('Action Integration Tests - Standalone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Data Processing', () => {
    it('should process form data correctly with different types', () => {
      const formData = new FormData();
      formData.append('title', 'Test Item');
      formData.append('price', '50000');
      formData.append('active', 'true');
      formData.append('count', '10');
      formData.append('disabled', 'false');

      const result = parseFormData(formData);

      expect(result).toEqual({
        title: 'Test Item',
        price: 50000,
        active: true,
        count: 10,
        disabled: false
      });
    });

    it('should handle file uploads', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('title', 'Test with File');
      formData.append('image', mockFile);

      const result = parseFormData(formData);

      expect(result.title).toBe('Test with File');
      expect(result.image).toBe(mockFile);
    });

    it('should handle checkbox values', () => {
      const formData = new FormData();
      formData.append('published', 'on'); // HTML checkbox value
      formData.append('featured', 'true');
      formData.append('archived', 'false');

      const result = parseFormData(formData);

      expect(result).toEqual({
        published: 'on', // parseFormData doesn't convert 'on' to boolean
        featured: true,
        archived: false
      });
    });

    it('should handle decimal numbers', () => {
      const formData = new FormData();
      formData.append('price', '1500.50');
      formData.append('discount', '0.15');

      const result = parseFormData(formData);

      expect(result).toEqual({
        price: 1500.50,
        discount: 0.15
      });
    });
  });

  describe('Validated Action Creation', () => {
    it('should create and execute validated action successfully', async () => {
      const testSchema = z.object({
        title: z.string().min(3),
        price: z.number().min(1000),
        active: z.boolean().optional()
      });

      const mockAction = jest.fn().mockResolvedValue(
        createSuccessResponse({ id: 123 }, 'Item created successfully') as never
      );

      const validatedAction = createValidatedAction(testSchema, mockAction);

      const formData = new FormData();
      formData.append('title', 'Test Item');
      formData.append('price', '50000');
      formData.append('active', 'true');

      const result = await validatedAction(formData);

      expect(mockAction).toHaveBeenCalledWith({
        title: 'Test Item',
        price: 50000,
        active: true
      }, undefined);

      expect(result).toEqual({
        success: true,
        data: { id: 123 },
        message: 'Item created successfully'
      });
    });

    it('should handle validation errors', async () => {
      const testSchema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      const mockAction = jest.fn();
      const validatedAction = createValidatedAction(testSchema, mockAction);

      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('age', '15');

      const result = await validatedAction(formData) as ActionState;

      expect(mockAction).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle user authentication option', async () => {
      const testSchema = z.object({
        title: z.string()
      });

      const mockAction = jest.fn().mockResolvedValue(
        createSuccessResponse({ postId: '123' }, 'Post created')
      );

      const mockGetUser = jest.fn().mockResolvedValue({ id: 'test-user', email: 'test@example.com' });

      const validatedAction = createValidatedAction(testSchema, mockAction, {
        withUser: true,
        getUserFn: mockGetUser
      });

      const formData = new FormData();
      formData.append('title', 'Test Post');

      const result = await validatedAction(formData);

      expect(mockAction).toHaveBeenCalledWith({
        title: 'Test Post'
      }, { id: 'test-user', email: 'test@example.com' });

      expect(result).toEqual({
        success: true,
        data: { postId: '123' },
        message: 'Post created'
      });
    });

    it('should handle action errors', async () => {
      const testSchema = z.object({
        title: z.string()
      });

      const mockAction = jest.fn().mockRejectedValue({
        body: { message: 'Database connection failed' }
      });

      const validatedAction = createValidatedAction(testSchema, mockAction);

      const formData = new FormData();
      formData.append('title', 'Test Title');

      const result = await validatedAction(formData) as ActionState;

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed'
      });
    });
  });

  describe('Error Handling', () => {
    it('should extract message from API error', () => {
      const apiError = {
        body: { message: 'User not found' }
      };

      const result = handleAPIError(apiError, 'Default error');

      expect(result).toEqual({
        success: false,
        error: 'User not found'
      });
    });

    it('should use fallback message for unknown errors', () => {
      const unknownError = new Error('Network timeout');

      const result = handleAPIError(unknownError, 'Connection failed');

      expect(result).toEqual({
        success: false,
        error: 'Connection failed'
      });
    });

    it('should use default fallback when no message provided', () => {
      const unknownError = { status: 500 };

      const result = handleAPIError(unknownError);

      expect(result).toEqual({
        success: false,
        error: 'Error desconocido'
      });
    });
  });

  describe('Response Formatting', () => {
    it('should create success responses correctly', () => {
      const response = createSuccessResponse(
        { userId: '123', name: 'John' },
        'User created successfully',
        true,
        '/dashboard'
      );

      expect(response).toEqual({
        success: true,
        data: { userId: '123', name: 'John' },
        message: 'User created successfully',
        redirect: true,
        url: '/dashboard'
      });
    });

    it('should create error responses correctly', () => {
      const response = createErrorResponse('Validation failed');

      expect(response).toEqual({
        success: false,
        error: 'Validation failed'
      });
    });

    it('should create success responses without optional parameters', () => {
      const response = createSuccessResponse();

      expect(response).toEqual({
        success: true
      });
    });
  });

  describe('ActionState Type Compatibility', () => {
    it('should work with generic ActionState types', () => {
      // Test with specific data type
      const userState: ActionState<{ user: { id: string; email: string } }> = {
        success: true,
        data: { user: { id: '123', email: 'test@example.com' } },
        message: 'User authenticated',
        redirect: true,
        url: '/dashboard'
      };

      expect(userState.success).toBe(true);
      expect(userState.data?.user.email).toBe('test@example.com');
      expect(userState.redirect).toBe(true);
    });

    it('should work with void ActionState', () => {
      const simpleState: ActionState = {
        success: true,
        message: 'Operation completed'
      };

      expect(simpleState.success).toBe(true);
      expect(simpleState.message).toBe('Operation completed');
      expect(simpleState.data).toBeUndefined();
    });

    it('should work with error states', () => {
      const errorState: ActionState = {
        success: false,
        error: 'Something went wrong'
      };

      expect(errorState.success).toBe(false);
      expect(errorState.error).toBe('Something went wrong');
    });
  });

  describe('Migration Compatibility', () => {
    it('should maintain backward compatibility with legacy types', () => {
      // Simulate legacy types using new generic system
      type SignInActionState = ActionState<{ user: any }>;
      type VerifyEmailActionState = ActionState<{ verified?: boolean }>;
      type ResetPasswordActionState = ActionState;

      const signInState: SignInActionState = {
        success: true,
        data: { user: { id: '123', email: 'test@example.com' } },
        redirect: true,
        url: '/dashboard'
      };

      const verifyState: VerifyEmailActionState = {
        success: true,
        data: { verified: true },
        message: 'Email verified successfully'
      };

      const resetState: ResetPasswordActionState = {
        success: true,
        message: 'Password reset email sent'
      };

      // All should work with the same interface
      expect(signInState.success).toBe(true);
      expect(verifyState.success).toBe(true);
      expect(resetState.success).toBe(true);

      expect(signInState.data?.user.email).toBe('test@example.com');
      expect(verifyState.data?.verified).toBe(true);
      expect(resetState.data).toBeUndefined();
    });

    it('should maintain consistent error response format', () => {
      const errorStates: ActionState[] = [
        { success: false, error: 'Validation failed' },
        { success: false, error: 'User not found' },
        { success: false, error: 'Invalid credentials' },
        { success: false, error: 'Database error' }
      ];

      errorStates.forEach(state => {
        expect(state.success).toBe(false);
        expect(typeof state.error).toBe('string');
        expect(state.data).toBeUndefined();
        expect(state.message).toBeUndefined();
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed data types in single form', async () => {
      const complexSchema = z.object({
        title: z.string().min(3),
        price: z.number().min(0),
        active: z.boolean(),
        image: z.instanceof(File).optional()
      });

      const mockAction = jest.fn().mockResolvedValue(
        createSuccessResponse({ id: 456 }, 'Complex data processed')
      );

      const validatedAction = createValidatedAction(complexSchema, mockAction);

      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('title', 'Complex Item');
      formData.append('price', '299.99');
      formData.append('active', 'true');
      formData.append('image', mockFile);

      const result = await validatedAction(formData) as ActionState<{ id: number }>;

      expect(mockAction).toHaveBeenCalledWith({
        title: 'Complex Item',
        price: 299.99,
        active: true,
        image: mockFile
      }, undefined);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(456);
    });

    it('should handle optional fields correctly', async () => {
      const optionalSchema = z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.number().optional(),
        active: z.boolean().optional()
      });

      const mockAction = jest.fn().mockResolvedValue(
        createSuccessResponse({}, 'Optional fields handled')
      );

      const validatedAction = createValidatedAction(optionalSchema, mockAction);

      const formData = new FormData();
      formData.append('title', 'Minimal Item');
      // Intentionally omit optional fields

      const result = await validatedAction(formData) as ActionState;

      expect(mockAction).toHaveBeenCalledWith({
        title: 'Minimal Item'
      }, undefined);

      expect(result.success).toBe(true);
    });
  });
});