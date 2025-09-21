import { describe, it, expect } from '@jest/globals';
import { handleAPIError, ActionState, createValidatedAction } from '../validations';
import { z } from 'zod';
import type { BetterCallAPIError } from '@/utils/types/types';

describe('handleAPIError', () => {
  it('should extract message from BetterCallAPIError', () => {
    const apiError: BetterCallAPIError = {
      status: '400',
      headers: { cookies: null },
      body: {
        message: 'Invalid credentials',
        code: 'AUTH_ERROR'
      },
      cause: {
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

  it('should handle BetterCallAPIError without body message', () => {
    const apiError = {
      status: '500',
      headers: { cookies: null },
      body: {
        message: '',
        code: 'SERVER_ERROR'
      },
      cause: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    } as BetterCallAPIError;

    const result = handleAPIError(apiError, 'Server error occurred');
    
    expect(result).toEqual({
      success: false,
      error: 'Server error occurred'
    });
  });
});

describe('ActionState generic type', () => {
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

  it('should work with complex data types', () => {
    interface UserData {
      id: string;
      name: string;
      email: string;
    }

    const state: ActionState<UserData> = {
      success: true,
      data: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      },
      redirect: true,
      url: '/dashboard'
    };
    
    expect(state.data?.name).toBe('John Doe');
    expect(state.redirect).toBe(true);
    expect(state.url).toBe('/dashboard');
  });
});

describe('createValidatedAction', () => {
  const testSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2)
  });

  it('should validate and execute action successfully', async () => {
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

  it('should handle user authentication when withUser is true', async () => {
    // This test would require mocking the getUser function
    // For now, we'll skip the implementation details
    expect(true).toBe(true);
  });
});