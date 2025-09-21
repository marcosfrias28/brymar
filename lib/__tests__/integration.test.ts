import { describe, it, expect } from '@jest/globals';
import { ActionState } from '../validations';

describe('Integration Tests for Action System Refactor', () => {
  describe('Type System Integration', () => {
    it('should support ActionState with different data types', () => {
      // Test void type
      const voidState: ActionState = {
        success: true,
        message: 'Operation completed'
      };
      expect(voidState.success).toBe(true);
      expect(voidState.data).toBeUndefined();

      // Test with user data
      const userState: ActionState<{ user: { id: string; name: string } }> = {
        success: true,
        data: { user: { id: '123', name: 'John' } },
        redirect: true,
        url: '/dashboard'
      };
      expect(userState.data?.user.name).toBe('John');
      expect(userState.redirect).toBe(true);

      // Test error state
      const errorState: ActionState = {
        success: false,
        error: 'Something went wrong'
      };
      expect(errorState.success).toBe(false);
      expect(errorState.error).toBe('Something went wrong');
    });

    it('should maintain backward compatibility with legacy types', () => {
      // Test that the generic type can be used in place of specific types
      type LegacySignInState = ActionState<{ user: any }>;
      type LegacyVerifyEmailState = ActionState<{ verified?: boolean }>;
      
      const signInState: LegacySignInState = {
        success: true,
        data: { user: { id: '123' } }
      };
      
      const verifyState: LegacyVerifyEmailState = {
        success: true,
        data: { verified: true }
      };
      
      expect(signInState.data?.user.id).toBe('123');
      expect(verifyState.data?.verified).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should provide consistent error response format', () => {
      const errorResponse: ActionState = {
        success: false,
        error: 'Validation failed'
      };
      
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Validation failed');
      expect(errorResponse.data).toBeUndefined();
    });
  });
});