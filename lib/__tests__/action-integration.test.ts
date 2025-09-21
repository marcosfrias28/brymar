import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { z } from 'zod';

// Mock dependencies
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://example.com/test-image.jpg' })
}));

jest.mock('../../lib/auth/auth', () => ({
  auth: {
    api: {
      signInEmail: jest.fn(),
      signUpEmail: jest.fn(),
      updateUser: jest.fn(),
      forgetPassword: jest.fn(),
      resetPassword: jest.fn(),
      sendVerificationOTP: jest.fn(),
      verifyEmailOTP: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

jest.mock('../../lib/email', () => ({
  sendVerificationOTP: jest.fn().mockResolvedValue(true)
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue(new Map())
}));

// Create mock database functions
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSelect = jest.fn();

jest.mock('../../lib/db/drizzle', () => ({
  default: {
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    select: mockSelect
  }
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

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
  
  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.type = options.type || '';
    this.size = options.size || 0;
  }
} as any;

describe('Action Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset database mocks
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Item' }])
      })
    });
    
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1, title: 'Updated Item' }])
        })
      })
    });
    
    mockDelete.mockReturnValue({
      where: jest.fn().mockResolvedValue([])
    });
    
    mockSelect.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Item' }])
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication Actions', () => {
    // Import actions dynamically to avoid module loading issues
    let signIn: any;
    let signUp: any;
    let updateUserAction: any;
    let forgotPassword: any;
    let resetPassword: any;
    let sendVerificationOTP: any;
    let verifyOTP: any;

    beforeEach(async () => {
      // Dynamic imports to handle mocking
      const authActions = await import('../../lib/actions/auth-actions');
      signIn = authActions.signIn;
      signUp = authActions.signUp;
      updateUserAction = authActions.updateUserAction;
      forgotPassword = authActions.forgotPassword;
      resetPassword = authActions.resetPassword;
      sendVerificationOTP = authActions.sendVerificationOTP;
      verifyOTP = authActions.verifyOTP;
    });

    describe('signIn action', () => {
      it('should successfully sign in user with valid credentials', async () => {
        const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.signInEmail as jest.Mock).mockResolvedValue({ user: mockUser });

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'TestPassword123!');

        const result = await signIn(formData);

        expect(auth.api.signInEmail).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'test@example.com',
            password: 'TestPassword123!'
          }
        });

        expect(result).toEqual({
          success: true,
          data: { user: mockUser },
          message: 'Has iniciado sesión exitosamente',
          redirect: true,
          url: '/profile'
        });
      });

      it('should handle sign in errors correctly', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const mockError = {
          body: { message: 'Invalid credentials' }
        };
        (auth.api.signInEmail as jest.Mock).mockRejectedValue(mockError);

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'wrongpassword');

        const result = await signIn(formData);

        expect(result).toEqual({
          success: false,
          error: 'Invalid credentials'
        });
      });

      it('should validate email format', async () => {
        const formData = new FormData();
        formData.append('email', 'invalid-email');
        formData.append('password', 'TestPassword123!');

        const result = await signIn(formData);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email');
      });

      it('should validate password length', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', '123');

        const result = await signIn(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('signUp action', () => {
      it('should successfully register user with valid data', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const { sendVerificationOTP } = await import('../../lib/email');
        
        (auth.api.signUpEmail as jest.Mock).mockResolvedValue({ success: true });
        (sendVerificationOTP as jest.Mock).mockResolvedValue(true);

        const formData = new FormData();
        formData.append('email', 'newuser@example.com');
        formData.append('password', 'TestPassword123!');
        formData.append('name', 'New User');

        const result = await signUp(formData);

        expect(auth.api.signUpEmail).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'newuser@example.com',
            password: 'TestPassword123!',
            name: 'New User',
            image: null
          }
        });

        expect(sendVerificationOTP).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toContain('Enlace de verificación enviado');
        expect(result.redirect).toBe(true);
        expect(result.url).toContain('/verify-email');
      });

      it('should handle image upload during registration', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const { put } = await import('@vercel/blob');
        
        (auth.api.signUpEmail as jest.Mock).mockResolvedValue({ success: true });
        (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/user-image.jpg' });

        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('email', 'newuser@example.com');
        formData.append('password', 'TestPassword123!');
        formData.append('name', 'New User');
        formData.append('image', mockFile);

        const result = await signUp(formData);

        expect(put).toHaveBeenCalledWith('user/newuser@example.com', mockFile, {
          access: 'public'
        });

        expect(auth.api.signUpEmail).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'newuser@example.com',
            password: 'TestPassword123!',
            name: 'New User',
            image: 'https://example.com/user-image.jpg'
          }
        });

        expect(result.success).toBe(true);
      });

      it('should handle registration errors', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const mockError = {
          body: { message: 'Email already exists' }
        };
        (auth.api.signUpEmail as jest.Mock).mockRejectedValue(mockError);

        const formData = new FormData();
        formData.append('email', 'existing@example.com');
        formData.append('password', 'TestPassword123!');
        formData.append('name', 'Test User');

        const result = await signUp(formData);

        expect(result).toEqual({
          success: false,
          error: 'Email already exists'
        });
      });
    });

    describe('updateUserAction', () => {
      it('should update user with authentication', async () => {
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.updateUser as jest.Mock).mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append('name', 'Updated Name');
        formData.append('email', 'updated@example.com');

        const result = await updateUserAction(formData);

        expect(auth.api.updateUser).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            name: 'Updated Name',
            email: 'updated@example.com',
            password: undefined,
            image: undefined,
            role: undefined
          }
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe('Usuario actualizado exitosamente');
      });

      it('should handle image upload during user update', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const { put } = await import('@vercel/blob');
        
        (auth.api.updateUser as jest.Mock).mockResolvedValue({ success: true });
        (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/updated-image.jpg' });

        const mockFile = new File(['test'], 'updated.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('name', 'Updated Name');
        formData.append('image', mockFile);

        const result = await updateUserAction(formData);

        expect(put).toHaveBeenCalled();
        expect(auth.api.updateUser).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            name: 'Updated Name',
            email: undefined,
            password: undefined,
            image: 'https://example.com/updated-image.jpg',
            role: undefined
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('forgotPassword action', () => {
      it('should send password reset email', async () => {
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.forgetPassword as jest.Mock).mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append('email', 'test@example.com');

        const result = await forgotPassword(formData);

        expect(auth.api.forgetPassword).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'test@example.com',
            redirectTo: '/reset-password'
          }
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain('Enlace de restablecimiento');
      });

      it('should handle forgot password errors', async () => {
        const { auth } = await import('../../lib/auth/auth');
        const mockError = {
          body: { message: 'User not found' }
        };
        (auth.api.forgetPassword as jest.Mock).mockRejectedValue(mockError);

        const formData = new FormData();
        formData.append('email', 'nonexistent@example.com');

        const result = await forgotPassword(formData);

        expect(result).toEqual({
          success: false,
          error: 'User not found'
        });
      });
    });

    describe('resetPassword action', () => {
      it('should reset password with valid token', async () => {
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.resetPassword as jest.Mock).mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append('password', 'NewPassword123!');
        formData.append('confirmPassword', 'NewPassword123!');
        formData.append('token', 'valid-reset-token');

        const result = await resetPassword(formData);

        expect(auth.api.resetPassword).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            newPassword: 'NewPassword123!',
            token: 'valid-reset-token'
          }
        });

        expect(result.success).toBe(true);
        expect(result.redirect).toBe(true);
        expect(result.url).toBe('/sign-in');
      });

      it('should validate password confirmation', async () => {
        const formData = new FormData();
        formData.append('password', 'NewPassword123!');
        formData.append('confirmPassword', 'DifferentPassword123!');
        formData.append('token', 'valid-reset-token');

        const result = await resetPassword(formData);

        expect(result).toEqual({
          success: false,
          error: 'Contraseñas no coinciden'
        });
      });
    });

    describe('sendVerificationOTP action', () => {
      it('should send verification OTP', async () => {
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.sendVerificationOTP as jest.Mock).mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append('email', 'test@example.com');

        const result = await sendVerificationOTP(formData);

        expect(auth.api.sendVerificationOTP).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'test@example.com',
            type: 'email-verification'
          }
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain('Verification code sent');
      });
    });

    describe('verifyOTP action', () => {
      it('should verify OTP successfully', async () => {
        const { auth } = await import('../../lib/auth/auth');
        (auth.api.verifyEmailOTP as jest.Mock).mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('otp', '123456');

        const result = await verifyOTP(formData);

        expect(auth.api.verifyEmailOTP).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            email: 'test@example.com',
            otp: '123456'
          }
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ verified: true });
        expect(result.redirect).toBe(true);
        expect(result.url).toBe('/dashboard');
      });

      it('should validate OTP format', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('otp', '123'); // Too short

        const result = await verifyOTP(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Property Actions', () => {
    let addProperty: any;
    let updateProperty: any;
    let searchPropertiesAction: any;

    beforeEach(async () => {
      const propertyActions = await import('../../app/actions/property-actions');
      addProperty = propertyActions.addProperty;
      updateProperty = propertyActions.updateProperty;
      searchPropertiesAction = propertyActions.searchPropertiesAction;
    });

    describe('addProperty action', () => {
      it('should add property with valid data', async () => {
        const mockValues = jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Property' }])
        });
        mockInsert.mockReturnValue({ values: mockValues });

        const formData = new FormData();
        formData.append('title', 'Test Property');
        formData.append('description', 'This is a test property description');
        formData.append('price', '500000');
        formData.append('type', 'villa');
        formData.append('bedrooms', '3');
        formData.append('bathrooms', '2');
        formData.append('area', '150');
        formData.append('location', 'Madrid');

        const result = await addProperty(formData);

        expect(mockValues).toHaveBeenCalledWith({
          title: 'Test Property',
          description: 'This is a test property description',
          price: 500000,
          type: 'villa',
          bedrooms: 3,
          bathrooms: 2,
          area: 150,
          location: 'Madrid',
          status: 'sale',
          images: []
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe('Propiedad agregada exitosamente!');
      });

      it('should validate required fields', async () => {
        const formData = new FormData();
        formData.append('title', 'Te'); // Too short
        formData.append('price', '500');  // Too low

        const result = await addProperty(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle database errors', async () => {
        mockInsert.mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        const formData = new FormData();
        formData.append('title', 'Test Property');
        formData.append('description', 'This is a test property description');
        formData.append('price', '500000');
        formData.append('type', 'villa');
        formData.append('bedrooms', '3');
        formData.append('bathrooms', '2');
        formData.append('area', '150');
        formData.append('location', 'Madrid');

        const result = await addProperty(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Error al agregar la propiedad');
      });
    });

    describe('updateProperty action', () => {
      it('should update property with valid data', async () => {
        const mockSet = jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 1, title: 'Updated Property' }])
        });
        mockUpdate.mockReturnValue({ set: mockSet });

        const formData = new FormData();
        formData.append('id', '1');
        formData.append('title', 'Updated Property');
        formData.append('description', 'This is an updated property description');
        formData.append('price', '600000');
        formData.append('type', 'apartment');
        formData.append('bedrooms', '2');
        formData.append('bathrooms', '1');
        formData.append('area', '100');
        formData.append('location', 'Barcelona');

        const result = await updateProperty(formData);

        expect(mockSet).toHaveBeenCalledWith({
          title: 'Updated Property',
          description: 'This is an updated property description',
          price: 600000,
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          area: 100,
          location: 'Barcelona',
          status: 'sale'
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe('Propiedad actualizada exitosamente!');
      });
    });

    describe('searchPropertiesAction', () => {
      it('should search properties with query', async () => {
        // Mock the searchProperties function result
        const mockSearchResult = {
          properties: [
            { id: 1, title: 'Villa Test', location: 'Madrid' }
          ],
          total: 1,
          totalPages: 1,
          currentPage: 1
        };

        // We need to mock the internal searchProperties function
        // This is a bit tricky since it's not exported, so we'll test the action directly
        const formData = new FormData();
        formData.append('query', 'villa');
        formData.append('page', '1');
        formData.append('limit', '12');

        const result = await searchPropertiesAction(formData);

        // The result should have the correct structure even if the search returns empty
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('data');
        if (result.success && result.data) {
          expect(result.data).toHaveProperty('properties');
          expect(result.data).toHaveProperty('total');
          expect(result.data).toHaveProperty('totalPages');
          expect(result.data).toHaveProperty('currentPage');
        }
      });

      it('should validate search query', async () => {
        const formData = new FormData();
        formData.append('query', ''); // Empty query

        const result = await searchPropertiesAction(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Blog Actions', () => {
    let addBlogPost: any;
    let updateBlogPost: any;
    let deleteBlogPost: any;
    let getBlogPostById: any;

    beforeEach(async () => {
      const blogActions = await import('../../app/actions/blog-actions');
      addBlogPost = blogActions.addBlogPost;
      updateBlogPost = blogActions.updateBlogPost;
      deleteBlogPost = blogActions.deleteBlogPost;
      getBlogPostById = blogActions.getBlogPostById;
    });

    describe('addBlogPost action', () => {
      it('should add blog post with valid data', async () => {
        const mockValues = jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 1,
            title: 'Test Blog Post',
            content: 'This is test content',
            author: 'Test Author'
          }])
        });
        mockInsert.mockReturnValue({ values: mockValues });

        const formData = new FormData();
        formData.append('title', 'Test Blog Post');
        formData.append('content', 'This is a test blog post content that is long enough to meet the minimum requirements');
        formData.append('author', 'Test Author');
        formData.append('category', 'property-news');
        formData.append('status', 'published');

        const result = await addBlogPost(formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Post de blog agregado exitosamente!');
        expect(result.data?.blogPost).toBeDefined();
      });

      it('should handle image upload for blog post', async () => {
        const { put } = await import('@vercel/blob');
        
        const mockValues = jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 1,
            title: 'Test Blog Post',
            image: 'https://example.com/blog-image.jpg'
          }])
        });
        mockInsert.mockReturnValue({ values: mockValues });
        (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/blog-image.jpg' });

        const mockFile = new File(['test'], 'blog-image.jpg', { type: 'image/jpeg', size: 1000 });
        const formData = new FormData();
        formData.append('title', 'Test Blog Post');
        formData.append('content', 'This is a test blog post content that is long enough to meet the minimum requirements');
        formData.append('author', 'Test Author');
        formData.append('image', mockFile);

        const result = await addBlogPost(formData);

        expect(put).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('should validate blog post content length', async () => {
        const formData = new FormData();
        formData.append('title', 'Test Blog Post');
        formData.append('content', 'Too short'); // Less than 50 characters
        formData.append('author', 'Test Author');

        const result = await addBlogPost(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('updateBlogPost action', () => {
      it('should update blog post with valid data', async () => {
        const mockSet = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{
              id: 1,
              title: 'Updated Blog Post'
            }])
          })
        });
        mockUpdate.mockReturnValue({ set: mockSet });

        const formData = new FormData();
        formData.append('id', '1');
        formData.append('title', 'Updated Blog Post');
        formData.append('content', 'This is updated blog post content that is long enough to meet the minimum requirements');
        formData.append('author', 'Updated Author');
        formData.append('category', 'market-analysis');
        formData.append('status', 'published');

        const result = await updateBlogPost(formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Post de blog actualizado exitosamente!');
      });
    });

    describe('deleteBlogPost action', () => {
      it('should delete blog post with valid ID', async () => {
        const mockWhere = jest.fn().mockResolvedValue([]);
        mockDelete.mockReturnValue({ where: mockWhere });

        const formData = new FormData();
        formData.append('id', '1');

        const result = await deleteBlogPost(formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Post de blog eliminado exitosamente!');
      });
    });

    describe('getBlogPostById action', () => {
      it('should get blog post by ID', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 1,
            title: 'Test Blog Post',
            content: 'Test content'
          }])
        });
        mockSelect.mockReturnValue({ from: mockFrom });

        const formData = new FormData();
        formData.append('id', '1');

        const result = await getBlogPostById(formData);

        expect(result.success).toBe(true);
        expect(result.data?.blogPost).toBeDefined();
      });
    });
  });

  describe('Form Data Processing', () => {
    it('should handle various form data types correctly', async () => {
      // Test with authentication action that processes different data types
      const { signUp } = await import('../../lib/actions/auth-actions');
      const { auth } = await import('../../lib/auth/auth');
      
      (auth.api.signUpEmail as jest.Mock).mockResolvedValue({ success: true });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'TestPassword123!');
      formData.append('name', 'Test User');

      const result = await signUp(formData);

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
          image: null
        }
      });

      expect(result.success).toBe(true);
    });

    it('should handle numeric form data conversion', async () => {
      const { addProperty } = await import('../../app/actions/property-actions');
      
      const mockValues = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1 }])
      });
      mockInsert.mockReturnValue({ values: mockValues });

      const formData = new FormData();
      formData.append('title', 'Test Property');
      formData.append('description', 'Test description for property');
      formData.append('price', '500000');      // String that should become number
      formData.append('bedrooms', '3');       // String that should become number
      formData.append('bathrooms', '2');      // String that should become number
      formData.append('area', '150');         // String that should become number
      formData.append('type', 'villa');
      formData.append('location', 'Madrid');

      const result = await addProperty(formData);

      expect(mockValues).toHaveBeenCalledWith({
        title: 'Test Property',
        description: 'Test description for property',
        price: 500000,        // Should be converted to number
        bedrooms: 3,          // Should be converted to number
        bathrooms: 2,         // Should be converted to number
        area: 150,            // Should be converted to number
        type: 'villa',
        location: 'Madrid',
        status: 'sale',
        images: []
      });

      expect(result.success).toBe(true);
    });

    it('should handle file uploads correctly', async () => {
      const { signUp } = await import('../../lib/actions/auth-actions');
      const { put } = await import('@vercel/blob');
      const { auth } = await import('../../lib/auth/auth');
      
      (auth.api.signUpEmail as jest.Mock).mockResolvedValue({ success: true });
      (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/uploaded-file.jpg' });

      const mockFile = new File(['test content'], 'test-image.jpg', { 
        type: 'image/jpeg',
        size: 1000
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'TestPassword123!');
      formData.append('name', 'Test User');
      formData.append('image', mockFile);

      const result = await signUp(formData);

      expect(put).toHaveBeenCalledWith('user/test@example.com', mockFile, {
        access: 'public'
      });

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
          image: 'https://example.com/uploaded-file.jpg'
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling Consistency', () => {
    it('should return consistent error format across all actions', async () => {
      const { signIn } = await import('../../lib/actions/auth-actions');
      const { auth } = await import('../../lib/auth/auth');
      
      const mockError = {
        body: { message: 'Test error message' }
      };
      (auth.api.signInEmail as jest.Mock).mockRejectedValue(mockError);

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      const result = await signIn(formData);

      expect(result).toEqual({
        success: false,
        error: 'Test error message'
      });
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
    });

    it('should handle unknown errors with fallback messages', async () => {
      const { addProperty } = await import('../../app/actions/property-actions');
      
      // Mock an unknown error
      mockInsert.mockImplementation(() => {
        throw new Error('Unknown database error');
      });

      const formData = new FormData();
      formData.append('title', 'Test Property');
      formData.append('description', 'Test description for property');
      formData.append('price', '500000');
      formData.append('type', 'villa');
      formData.append('bedrooms', '3');
      formData.append('bathrooms', '2');
      formData.append('area', '150');
      formData.append('location', 'Madrid');

      const result = await addProperty(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al agregar la propiedad');
    });
  });
});