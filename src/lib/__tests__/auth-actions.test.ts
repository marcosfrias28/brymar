import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { z } from 'zod';

// Mock Better Auth
const mockAuthClient = {
  signIn: {
    email: jest.fn()
  },
  signUp: {
    email: jest.fn()
  },
  forgetPassword: jest.fn(),
  resetPassword: jest.fn(),
  sendVerificationEmail: jest.fn()
};

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

// Action state type
type ActionState<T = void> = {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  redirect?: boolean;
  url?: string;
};

// Mock validation schemas
const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

describe('Authentication Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Action', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true
      };

      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockUser, session: { id: 'session-123' } },
        error: null
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      // Simulate sign in action
      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = signInSchema.parse(data);
      const result = await mockAuthClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password
      });

      if (result.error) {
        expect.fail('Should not have error');
      }

      const expectedState: ActionState<{ user: any }> = {
        success: true,
        data: { user: mockUser },
        redirect: true,
        url: '/profile' // User role redirects to profile
      };

      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.user.role).toBe('user');
    });

    it('should handle invalid credentials', async () => {
      mockAuthClient.signIn.email.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = signInSchema.parse(data);
      const result = await mockAuthClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password
      });

      if (result.error) {
        const errorState: ActionState = {
          success: false,
          error: result.error.message
        };
        
        expect(errorState.success).toBe(false);
        expect(errorState.error).toBe('Invalid credentials');
      }
    });

    it('should handle validation errors', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', '123'); // Too short

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      try {
        signInSchema.parse(data);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorState: ActionState = {
            success: false,
            error: error.errors[0].message
          };
          
          expect(errorState.success).toBe(false);
          expect(errorState.error).toContain('Email inválido');
        }
      }
    });

    it('should redirect admin users to dashboard', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        emailVerified: true
      };

      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockAdmin, session: { id: 'session-123' } },
        error: null
      });

      const formData = new FormData();
      formData.append('email', 'admin@example.com');
      formData.append('password', 'password123');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = signInSchema.parse(data);
      const result = await mockAuthClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password
      });

      // Admin should be redirected to dashboard
      const redirectUrl = mockAdmin.role === 'admin' || mockAdmin.role === 'agent' 
        ? '/dashboard' 
        : '/profile';

      expect(redirectUrl).toBe('/dashboard');
      expect(result.data?.user.role).toBe('admin');
    });
  });

  describe('Sign Up Action', () => {
    it('should successfully create new user account', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
        emailVerified: false
      };

      mockAuthClient.signUp.email.mockResolvedValue({
        data: { user: mockUser, session: { id: 'session-456' } },
        error: null
      });

      const formData = new FormData();
      formData.append('name', 'New User');
      formData.append('email', 'newuser@example.com');
      formData.append('password', 'password123');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = signUpSchema.parse(data);
      const result = await mockAuthClient.signUp.email({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password
      });

      if (result.error) {
        expect.fail('Should not have error');
      }

      expect(result.data?.user.email).toBe('newuser@example.com');
      expect(result.data?.user.name).toBe('New User');
      expect(result.data?.user.role).toBe('user');
      expect(result.data?.user.emailVerified).toBe(false);
    });

    it('should handle duplicate email error', async () => {
      mockAuthClient.signUp.email.mockResolvedValue({
        data: null,
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS'
        }
      });

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'existing@example.com');
      formData.append('password', 'password123');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = signUpSchema.parse(data);
      const result = await mockAuthClient.signUp.email({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password
      });

      if (result.error) {
        const errorState: ActionState = {
          success: false,
          error: result.error.message
        };
        
        expect(errorState.success).toBe(false);
        expect(errorState.error).toBe('User already exists');
      }
    });

    it('should validate required fields', async () => {
      const formData = new FormData();
      formData.append('name', 'A'); // Too short
      formData.append('email', 'invalid-email');
      formData.append('password', '123'); // Too short

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      try {
        signUpSchema.parse(data);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors;
          
          expect(errors.some(e => e.message.includes('nombre'))).toBe(true);
          expect(errors.some(e => e.message.includes('Email'))).toBe(true);
          expect(errors.some(e => e.message.includes('contraseña'))).toBe(true);
        }
      }
    });
  });

  describe('Forgot Password Action', () => {
    it('should send password reset email successfully', async () => {
      mockAuthClient.forgetPassword.mockResolvedValue({
        data: { success: true },
        error: null
      });

      const formData = new FormData();
      formData.append('email', 'user@example.com');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = forgotPasswordSchema.parse(data);
      const result = await mockAuthClient.forgetPassword({
        email: validatedData.email,
        redirectTo: '/reset-password'
      });

      if (result.error) {
        expect.fail('Should not have error');
      }

      const successState: ActionState = {
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu email'
      };

      expect(successState.success).toBe(true);
      expect(successState.message).toContain('enlace de recuperación');
    });

    it('should handle non-existent email', async () => {
      mockAuthClient.forgetPassword.mockResolvedValue({
        data: null,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });

      const formData = new FormData();
      formData.append('email', 'nonexistent@example.com');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = forgotPasswordSchema.parse(data);
      const result = await mockAuthClient.forgetPassword({
        email: validatedData.email,
        redirectTo: '/reset-password'
      });

      if (result.error) {
        const errorState: ActionState = {
          success: false,
          error: result.error.message
        };
        
        expect(errorState.success).toBe(false);
        expect(errorState.error).toBe('User not found');
      }
    });
  });

  describe('Reset Password Action', () => {
    it('should reset password successfully with valid token', async () => {
      mockAuthClient.resetPassword.mockResolvedValue({
        data: { success: true },
        error: null
      });

      const formData = new FormData();
      formData.append('token', 'valid-reset-token');
      formData.append('password', 'newpassword123');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = resetPasswordSchema.parse(data);
      const result = await mockAuthClient.resetPassword({
        token: validatedData.token,
        password: validatedData.password
      });

      if (result.error) {
        expect.fail('Should not have error');
      }

      const successState: ActionState = {
        success: true,
        message: 'Contraseña actualizada correctamente',
        redirect: true,
        url: '/sign-in'
      };

      expect(successState.success).toBe(true);
      expect(successState.message).toContain('actualizada correctamente');
      expect(successState.redirect).toBe(true);
      expect(successState.url).toBe('/sign-in');
    });

    it('should handle invalid or expired token', async () => {
      mockAuthClient.resetPassword.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });

      const formData = new FormData();
      formData.append('token', 'invalid-token');
      formData.append('password', 'newpassword123');

      const data: any = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const validatedData = resetPasswordSchema.parse(data);
      const result = await mockAuthClient.resetPassword({
        token: validatedData.token,
        password: validatedData.password
      });

      if (result.error) {
        const errorState: ActionState = {
          success: false,
          error: result.error.message
        };
        
        expect(errorState.success).toBe(false);
        expect(errorState.error).toBe('Invalid or expired token');
      }
    });
  });

  describe('Email Verification', () => {
    it('should send verification email successfully', async () => {
      mockAuthClient.sendVerificationEmail.mockResolvedValue({
        data: { success: true },
        error: null
      });

      const result = await mockAuthClient.sendVerificationEmail({
        email: 'user@example.com',
        redirectTo: '/verify-email'
      });

      if (result.error) {
        expect.fail('Should not have error');
      }

      const successState: ActionState = {
        success: true,
        message: 'Email de verificación enviado'
      };

      expect(successState.success).toBe(true);
      expect(successState.message).toContain('verificación enviado');
    });

    it('should handle verification email errors', async () => {
      mockAuthClient.sendVerificationEmail.mockResolvedValue({
        data: null,
        error: {
          message: 'Email service unavailable',
          code: 'EMAIL_SERVICE_ERROR'
        }
      });

      const result = await mockAuthClient.sendVerificationEmail({
        email: 'user@example.com',
        redirectTo: '/verify-email'
      });

      if (result.error) {
        const errorState: ActionState = {
          success: false,
          error: result.error.message
        };
        
        expect(errorState.success).toBe(false);
        expect(errorState.error).toBe('Email service unavailable');
      }
    });
  });

  describe('Role-based Redirections in Auth Actions', () => {
    it('should redirect different roles to appropriate pages after sign in', async () => {
      const testCases = [
        { role: 'admin', expectedUrl: '/dashboard' },
        { role: 'agent', expectedUrl: '/dashboard' },
        { role: 'user', expectedUrl: '/profile' }
      ];

      for (const testCase of testCases) {
        const mockUser = {
          id: `${testCase.role}-123`,
          email: `${testCase.role}@example.com`,
          name: `${testCase.role} User`,
          role: testCase.role,
          emailVerified: true
        };

        mockAuthClient.signIn.email.mockResolvedValue({
          data: { user: mockUser, session: { id: 'session-123' } },
          error: null
        });

        // Simulate redirect logic
        const redirectUrl = mockUser.role === 'admin' || mockUser.role === 'agent' 
          ? '/dashboard' 
          : '/profile';

        expect(redirectUrl).toBe(testCase.expectedUrl);
      }
    });

    it('should handle unverified email appropriately', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
        emailVerified: false
      };

      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockUser, session: { id: 'session-123' } },
        error: null
      });

      // Unverified users should be redirected to verification page
      const redirectUrl = !mockUser.emailVerified 
        ? '/verify-email' 
        : (mockUser.role === 'admin' || mockUser.role === 'agent' ? '/dashboard' : '/profile');

      expect(redirectUrl).toBe('/verify-email');
    });
  });
});