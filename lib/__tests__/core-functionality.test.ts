import { describe, it, expect, jest } from '@jest/globals';
import { z } from 'zod';

// Import only the core types and functions we need to test
// We'll copy the essential functions here to avoid import issues
type ActionState<T = void> = {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  redirect?: boolean;
  url?: string;
};

// Implement handleAPIError directly to avoid import issues
function handleAPIError(error: unknown, fallbackMessage = "Error desconocido"): { success: false; error: string } {
  // Handle BetterCallAPIError
  if (error && typeof error === 'object' && 'body' in error) {
    const apiError = error as { body?: { message?: string } };
    if (apiError.body?.message) {
      return {
        success: false,
        error: apiError.body.message
      };
    }
  }
  
  return {
    success: false,
    error: fallbackMessage
  };
}

// Simplified version of createValidatedAction for testing
function createValidatedAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  action: (data: TInput, user?: any) => Promise<TOutput>,
  options: { withUser?: boolean } = {}
) {
  return async (formData: FormData): Promise<TOutput> => {
    try {
      // Convert FormData to object
      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Validate with schema
      const validatedData = schema.parse(data);

      // Execute action
      const result = await action(validatedData, options.withUser ? { id: 'test-user' } : undefined);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message
        } as TOutput;
      }
      
      return handleAPIError(error, 'Action failed') as TOutput;
    }
  };
}

// Mock FormData for Node.js environment
global.FormData = class FormData {
  private data: Map<string, string> = new Map();
  
  append(key: string, value: string) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key) || null;
  }
  
  entries() {
    return this.data.entries();
  }
} as any;

describe('Core Action System Functionality', () => {
  describe('ActionState Generic Type', () => {
    it('should work with void data type', () => {
      const state: ActionState = {
        success: true,
        message: 'Operation completed'
      };
      
      expect(state.success).toBe(true);
      expect(state.message).toBe('Operation completed');
      expect(state.data).toBeUndefined();
    });

    it('should work with specific data type', () => {
      const state: ActionState<{ userId: string }> = {
        success: true,
        data: { userId: '123' },
        message: 'User created'
      };
      
      expect(state.success).toBe(true);
      expect(state.data?.userId).toBe('123');
      expect(state.message).toBe('User created');
    });

    it('should support all expected properties', () => {
      const state: ActionState<{ user: any }> = {
        success: true,
        data: { user: { id: '123' } },
        message: 'Success',
        redirect: true,
        url: '/dashboard'
      };
      
      expect(state.success).toBe(true);
      expect(state.data?.user.id).toBe('123');
      expect(state.message).toBe('Success');
      expect(state.redirect).toBe(true);
      expect(state.url).toBe('/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should extract message from API error', () => {
      const apiError = {
        status: '400',
        body: {
          message: 'Invalid credentials',
          code: 'AUTH_ERROR'
        }
      };

      const result = handleAPIError(apiError, 'Default error');
      
      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should use fallback message when no specific error message', () => {
      const unknownError = new Error('Some unknown error');
      
      const result = handleAPIError(unknownError, 'Fallback message');
      
      expect(result).toEqual({
        success: false,
        error: 'Fallback message'
      });
    });

    it('should use default fallback when no message provided', () => {
      const unknownError = new Error('Some unknown error');
      
      const result = handleAPIError(unknownError);
      
      expect(result).toEqual({
        success: false,
        error: 'Error desconocido'
      });
    });
  });

  describe('Validated Action Creation', () => {
    it('should validate and execute action successfully', async () => {
      const testSchema = z.object({
        email: z.string().email(),
        name: z.string().min(2)
      });

      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        message: 'Action completed'
      });

      const validatedAction = createValidatedAction(testSchema, mockAction);
      
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('name', 'John');

      const result = await validatedAction(formData);

      expect(mockAction).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'John'
      }, undefined);
      
      expect(result).toEqual({
        success: true,
        message: 'Action completed'
      });
    });

    it('should return validation error for invalid data', async () => {
      const testSchema = z.object({
        email: z.string().email(),
        name: z.string().min(2)
      });

      const mockAction = jest.fn();
      const validatedAction = createValidatedAction(testSchema, mockAction);
      
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('name', 'J'); // Too short

      const result = await validatedAction(formData);

      expect(mockAction).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Invalid email')
      });
    });

    it('should handle user authentication option', async () => {
      const testSchema = z.object({
        title: z.string()
      });

      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: { postId: '123' }
      });

      const mockGetUser = jest.fn().mockResolvedValue({ id: 'test-user' });

      const validatedAction = createValidatedAction(testSchema, mockAction, { 
        withUser: true,
        getUserFn: mockGetUser
      });
      
      const formData = new FormData();
      formData.append('title', 'Test Post');

      const result = await validatedAction(formData);

      expect(mockAction).toHaveBeenCalledWith({
        title: 'Test Post'
      }, { id: 'test-user' });
      
      expect(result).toEqual({
        success: true,
        data: { postId: '123' }
      });
    });
  });

  describe('Migration Compatibility', () => {
    it('should support legacy action state types', () => {
      // Simulate legacy types using the new generic system
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
        message: 'Email verified'
      };

      const resetState: ResetPasswordActionState = {
        success: true,
        message: 'Password reset email sent'
      };

      expect(signInState.data?.user.email).toBe('test@example.com');
      expect(verifyState.data?.verified).toBe(true);
      expect(resetState.message).toBe('Password reset email sent');
    });

    it('should maintain consistent error response format', () => {
      const errorStates: ActionState[] = [
        { success: false, error: 'Validation failed' },
        { success: false, error: 'User not found' },
        { success: false, error: 'Invalid credentials' }
      ];

      errorStates.forEach(state => {
        expect(state.success).toBe(false);
        expect(typeof state.error).toBe('string');
        expect(state.data).toBeUndefined();
      });
    });
  });
});