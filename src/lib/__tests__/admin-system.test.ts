import { describe, it, expect } from '@jest/globals';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  adminConfig,
  isPublicRoute,
  getRedirectUrlForRole,
  shouldRedirectUser,
  getRequiredPermission,
  type UserRole,
  type Permission
} from '../auth/admin-config';

describe('Better Auth Admin Plugin System', () => {
  describe('Permissions Configuration', () => {
    it('should have all required permissions defined', () => {
      const expectedPermissions = [
        'dashboard.access',
        'analytics.view',
        'settings.view',
        'properties.view',
        'properties.manage',
        'lands.view',
        'lands.manage',
        'blog.view',
        'blog.manage',
        'users.view',
        'users.manage',
        'profile.access',
        'profile.manage'
      ];

      const actualPermissions = Object.values(PERMISSIONS);
      
      expectedPermissions.forEach(permission => {
        expect(actualPermissions).toContain(permission);
      });
    });

    it('should have consistent permission naming convention', () => {
      const permissions = Object.values(PERMISSIONS);
      
      permissions.forEach(permission => {
        // Should follow pattern: resource.action
        expect(permission).toMatch(/^[a-z]+\.[a-z]+$/);
      });
    });
  });

  describe('Role Permissions', () => {
    it('should define permissions for all roles', () => {
      const roles: UserRole[] = ['admin', 'agent', 'user'];
      
      roles.forEach(role => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
        expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
      });
    });

    it('should give admin full access to all permissions', () => {
      const allPermissions = Object.values(PERMISSIONS);
      const adminPermissions = ROLE_PERMISSIONS.admin;
      
      allPermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission);
      });
    });

    it('should give agent limited but sufficient permissions', () => {
      const agentPermissions = ROLE_PERMISSIONS.agent;
      
      // Should have dashboard access
      expect(agentPermissions).toContain(PERMISSIONS.DASHBOARD_ACCESS);
      
      // Should manage properties and lands
      expect(agentPermissions).toContain(PERMISSIONS.PROPERTIES_MANAGE);
      expect(agentPermissions).toContain(PERMISSIONS.LANDS_MANAGE);
      
      // Should NOT have user management or analytics
      expect(agentPermissions).not.toContain(PERMISSIONS.USERS_MANAGE);
      expect(agentPermissions).not.toContain(PERMISSIONS.ANALYTICS_VIEW);
      expect(agentPermissions).not.toContain(PERMISSIONS.BLOG_MANAGE);
    });

    it('should give user basic permissions only', () => {
      const userPermissions = ROLE_PERMISSIONS.user;
      
      // Should have view permissions
      expect(userPermissions).toContain(PERMISSIONS.PROPERTIES_VIEW);
      expect(userPermissions).toContain(PERMISSIONS.LANDS_VIEW);
      expect(userPermissions).toContain(PERMISSIONS.BLOG_VIEW);
      expect(userPermissions).toContain(PERMISSIONS.PROFILE_ACCESS);
      
      // Should NOT have dashboard or management permissions
      expect(userPermissions).not.toContain(PERMISSIONS.DASHBOARD_ACCESS);
      expect(userPermissions).not.toContain(PERMISSIONS.PROPERTIES_MANAGE);
      expect(userPermissions).not.toContain(PERMISSIONS.USERS_MANAGE);
    });
  });

  describe('Admin Configuration', () => {
    it('should have correct default configuration', () => {
      expect(adminConfig.roles).toEqual(['admin', 'agent', 'user']);
      expect(adminConfig.defaultRole).toBe('user');
    });

    it('should map permissions to correct roles', () => {
      // Dashboard access - admin and agent only
      expect(adminConfig.permissions[PERMISSIONS.DASHBOARD_ACCESS]).toEqual(['admin', 'agent']);
      
      // Analytics - admin only
      expect(adminConfig.permissions[PERMISSIONS.ANALYTICS_VIEW]).toEqual(['admin']);
      
      // Properties view - all roles
      expect(adminConfig.permissions[PERMISSIONS.PROPERTIES_VIEW]).toEqual(['admin', 'agent', 'user']);
      
      // User management - admin only
      expect(adminConfig.permissions[PERMISSIONS.USERS_MANAGE]).toEqual(['admin']);
    });
  });

  describe('Public Routes', () => {
    it('should correctly identify public routes', () => {
      const publicPaths = [
        '/',
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/properties',
        '/properties/123',
        '/lands',
        '/blog',
        '/blog/post-1',
        '/about',
        '/contact',
        '/search',
        '/api/auth/signin'
      ];

      publicPaths.forEach(path => {
        expect(isPublicRoute(path)).toBe(true);
      });
    });

    it('should correctly identify protected routes', () => {
      const protectedPaths = [
        '/dashboard',
        '/dashboard/properties',
        '/profile',
        '/profile/settings',
        '/admin',
        '/settings'
      ];

      protectedPaths.forEach(path => {
        expect(isPublicRoute(path)).toBe(false);
      });
    });

    it('should handle edge cases for route matching', () => {
      // Exact match for root
      expect(isPublicRoute('/')).toBe(true);
      expect(isPublicRoute('/dashboard')).toBe(false);
      
      // Prefix matching
      expect(isPublicRoute('/properties/123/details')).toBe(true);
      expect(isPublicRoute('/api/auth/callback')).toBe(true);
    });
  });

  describe('Role-based Redirections', () => {
    it('should provide correct redirect URLs for each role', () => {
      expect(getRedirectUrlForRole('admin')).toBe('/dashboard');
      expect(getRedirectUrlForRole('agent')).toBe('/dashboard');
      expect(getRedirectUrlForRole('user')).toBe('/profile');
    });

    it('should redirect admin from profile to dashboard', () => {
      expect(shouldRedirectUser('/profile', 'admin')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/settings', 'admin')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/favorites', 'admin')).toBe('/dashboard');
    });

    it('should redirect agent from profile to dashboard', () => {
      expect(shouldRedirectUser('/profile', 'agent')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/settings', 'agent')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/notifications', 'agent')).toBe('/dashboard');
    });

    it('should redirect user from dashboard to profile', () => {
      expect(shouldRedirectUser('/dashboard', 'user')).toBe('/profile');
      expect(shouldRedirectUser('/dashboard/properties', 'user')).toBe('/profile');
      expect(shouldRedirectUser('/dashboard/settings', 'user')).toBe('/profile');
    });

    it('should not redirect when user is on correct route', () => {
      // Admin/Agent on dashboard - no redirect
      expect(shouldRedirectUser('/dashboard', 'admin')).toBeNull();
      expect(shouldRedirectUser('/dashboard/properties', 'agent')).toBeNull();
      
      // User on profile - no redirect
      expect(shouldRedirectUser('/profile', 'user')).toBeNull();
      expect(shouldRedirectUser('/profile/settings', 'user')).toBeNull();
      
      // Public routes - no redirect
      expect(shouldRedirectUser('/properties', 'admin')).toBeNull();
      expect(shouldRedirectUser('/blog', 'user')).toBeNull();
    });
  });

  describe('Route Permissions', () => {
    it('should map dashboard routes to correct permissions', () => {
      expect(getRequiredPermission('/dashboard')).toBe(PERMISSIONS.DASHBOARD_ACCESS);
      expect(getRequiredPermission('/dashboard/properties')).toBe(PERMISSIONS.PROPERTIES_MANAGE);
      expect(getRequiredPermission('/dashboard/lands')).toBe(PERMISSIONS.LANDS_MANAGE);
      expect(getRequiredPermission('/dashboard/blog')).toBe(PERMISSIONS.BLOG_MANAGE);
      expect(getRequiredPermission('/dashboard/users')).toBe(PERMISSIONS.USERS_MANAGE);
      expect(getRequiredPermission('/dashboard/analytics')).toBe(PERMISSIONS.ANALYTICS_VIEW);
    });

    it('should map profile routes to correct permissions', () => {
      expect(getRequiredPermission('/profile')).toBe(PERMISSIONS.PROFILE_ACCESS);
      expect(getRequiredPermission('/profile/settings')).toBe(PERMISSIONS.PROFILE_MANAGE);
      expect(getRequiredPermission('/profile/favorites')).toBe(PERMISSIONS.PROFILE_ACCESS);
      expect(getRequiredPermission('/profile/activity')).toBe(PERMISSIONS.PROFILE_ACCESS);
    });

    it('should return null for routes without specific permissions', () => {
      expect(getRequiredPermission('/unknown-route')).toBeNull();
      expect(getRequiredPermission('/api/some-endpoint')).toBeNull();
      expect(getRequiredPermission('/random-path')).toBeNull();
    });

    it('should match most specific route first', () => {
      // More specific routes should take precedence
      expect(getRequiredPermission('/dashboard/properties/create')).toBe(PERMISSIONS.PROPERTIES_MANAGE);
      expect(getRequiredPermission('/profile/settings/security')).toBe(PERMISSIONS.PROFILE_MANAGE);
    });
  });

  describe('Permission Validation', () => {
    it('should validate admin permissions correctly', () => {
      const adminPermissions = adminConfig.permissions;
      
      // Admin should have access to everything
      Object.keys(adminPermissions).forEach(permission => {
        const allowedRoles = adminPermissions[permission as Permission];
        expect(allowedRoles).toContain('admin');
      });
    });

    it('should validate agent permissions correctly', () => {
      const agentAllowedPermissions = [
        PERMISSIONS.DASHBOARD_ACCESS,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.PROPERTIES_VIEW,
        PERMISSIONS.PROPERTIES_MANAGE,
        PERMISSIONS.LANDS_VIEW,
        PERMISSIONS.LANDS_MANAGE,
        PERMISSIONS.BLOG_VIEW,
        PERMISSIONS.PROFILE_ACCESS,
        PERMISSIONS.PROFILE_MANAGE
      ];

      agentAllowedPermissions.forEach(permission => {
        const allowedRoles = adminConfig.permissions[permission];
        expect(allowedRoles).toContain('agent');
      });

      // Agent should NOT have these permissions
      const agentDeniedPermissions = [
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.BLOG_MANAGE,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_MANAGE
      ];

      agentDeniedPermissions.forEach(permission => {
        const allowedRoles = adminConfig.permissions[permission];
        expect(allowedRoles).not.toContain('agent');
      });
    });

    it('should validate user permissions correctly', () => {
      const userAllowedPermissions = [
        PERMISSIONS.PROPERTIES_VIEW,
        PERMISSIONS.LANDS_VIEW,
        PERMISSIONS.BLOG_VIEW,
        PERMISSIONS.PROFILE_ACCESS,
        PERMISSIONS.PROFILE_MANAGE
      ];

      userAllowedPermissions.forEach(permission => {
        const allowedRoles = adminConfig.permissions[permission];
        expect(allowedRoles).toContain('user');
      });

      // User should NOT have management permissions
      const userDeniedPermissions = [
        PERMISSIONS.DASHBOARD_ACCESS,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.PROPERTIES_MANAGE,
        PERMISSIONS.LANDS_MANAGE,
        PERMISSIONS.BLOG_MANAGE,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_MANAGE
      ];

      userDeniedPermissions.forEach(permission => {
        const allowedRoles = adminConfig.permissions[permission];
        expect(allowedRoles).not.toContain('user');
      });
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      // Test that types are properly exported and usable
      const testRole: UserRole = 'admin';
      const testPermission: Permission = 'dashboard.access';
      
      expect(['admin', 'agent', 'user']).toContain(testRole);
      expect(Object.values(PERMISSIONS)).toContain(testPermission);
    });

    it('should maintain type consistency across configurations', () => {
      // All roles in adminConfig should be valid UserRole types
      adminConfig.roles.forEach(role => {
        expect(['admin', 'agent', 'user']).toContain(role);
      });

      // All permissions in adminConfig should be valid Permission types
      Object.keys(adminConfig.permissions).forEach(permission => {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      });
    });
  });
});