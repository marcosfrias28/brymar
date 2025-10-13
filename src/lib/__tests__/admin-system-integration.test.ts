import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Import the actual admin config functions
import {
  isPublicRoute,
  getRedirectUrlForRole,
  shouldRedirectUser,
  getRequiredPermission,
  PERMISSIONS,
  adminConfig,
  type UserRole
} from '../auth/admin-config';

describe('Admin System Integration Tests', () => {
  describe('Real Admin Config Functions', () => {
    it('should correctly identify public routes', () => {
      // Test public routes
      expect(isPublicRoute('/')).toBe(true);
      expect(isPublicRoute('/sign-in')).toBe(true);
      expect(isPublicRoute('/sign-up')).toBe(true);
      expect(isPublicRoute('/properties')).toBe(true);
      expect(isPublicRoute('/properties/123')).toBe(true);
      expect(isPublicRoute('/blog')).toBe(true);
      expect(isPublicRoute('/api/auth/signin')).toBe(true);

      // Test protected routes
      expect(isPublicRoute('/dashboard')).toBe(false);
      expect(isPublicRoute('/profile')).toBe(false);
      expect(isPublicRoute('/dashboard/properties')).toBe(false);
    });

    it('should provide correct redirect URLs for roles', () => {
      expect(getRedirectUrlForRole('admin')).toBe('/dashboard');
      expect(getRedirectUrlForRole('agent')).toBe('/dashboard');
      expect(getRedirectUrlForRole('user')).toBe('/profile');
    });

    it('should handle role-based redirections correctly', () => {
      // Admin accessing profile should redirect to dashboard
      expect(shouldRedirectUser('/profile', 'admin')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/settings', 'admin')).toBe('/dashboard');
      
      // Agent accessing profile should redirect to dashboard
      expect(shouldRedirectUser('/profile', 'agent')).toBe('/dashboard');
      expect(shouldRedirectUser('/profile/favorites', 'agent')).toBe('/dashboard');
      
      // User accessing dashboard should redirect to profile
      expect(shouldRedirectUser('/dashboard', 'user')).toBe('/profile');
      expect(shouldRedirectUser('/dashboard/properties', 'user')).toBe('/profile');
      
      // No redirect when on correct route
      expect(shouldRedirectUser('/dashboard', 'admin')).toBeNull();
      expect(shouldRedirectUser('/dashboard', 'agent')).toBeNull();
      expect(shouldRedirectUser('/profile', 'user')).toBeNull();
      
      // No redirect for public routes
      expect(shouldRedirectUser('/properties', 'admin')).toBeNull();
      expect(shouldRedirectUser('/blog', 'user')).toBeNull();
    });

    it('should map routes to correct permissions', () => {
      expect(getRequiredPermission('/dashboard')).toBe(PERMISSIONS.DASHBOARD_ACCESS);
      expect(getRequiredPermission('/dashboard/properties')).toBe(PERMISSIONS.PROPERTIES_MANAGE);
      expect(getRequiredPermission('/dashboard/users')).toBe(PERMISSIONS.USERS_MANAGE);
      expect(getRequiredPermission('/profile')).toBe(PERMISSIONS.PROFILE_ACCESS);
      expect(getRequiredPermission('/profile/settings')).toBe(PERMISSIONS.PROFILE_MANAGE);
      
      // Routes without specific permissions
      expect(getRequiredPermission('/unknown-route')).toBeNull();
    });

    it('should validate permission mappings in admin config', () => {
      // Test dashboard access
      expect(adminConfig.permissions[PERMISSIONS.DASHBOARD_ACCESS]).toContain('admin');
      expect(adminConfig.permissions[PERMISSIONS.DASHBOARD_ACCESS]).toContain('agent');
      expect(adminConfig.permissions[PERMISSIONS.DASHBOARD_ACCESS]).not.toContain('user');
      
      // Test analytics (admin only)
      expect(adminConfig.permissions[PERMISSIONS.ANALYTICS_VIEW]).toContain('admin');
      expect(adminConfig.permissions[PERMISSIONS.ANALYTICS_VIEW]).not.toContain('agent');
      expect(adminConfig.permissions[PERMISSIONS.ANALYTICS_VIEW]).not.toContain('user');
      
      // Test properties view (all roles)
      expect(adminConfig.permissions[PERMISSIONS.PROPERTIES_VIEW]).toContain('admin');
      expect(adminConfig.permissions[PERMISSIONS.PROPERTIES_VIEW]).toContain('agent');
      expect(adminConfig.permissions[PERMISSIONS.PROPERTIES_VIEW]).toContain('user');
      
      // Test user management (admin only)
      expect(adminConfig.permissions[PERMISSIONS.USERS_MANAGE]).toContain('admin');
      expect(adminConfig.permissions[PERMISSIONS.USERS_MANAGE]).not.toContain('agent');
      expect(adminConfig.permissions[PERMISSIONS.USERS_MANAGE]).not.toContain('user');
    });
  });

  describe('Permission Validation Logic', () => {
    function hasPermission(permission: string, userRole: UserRole): boolean {
      const allowedRoles = adminConfig.permissions[permission as keyof typeof adminConfig.permissions];
      return allowedRoles ? allowedRoles.includes(userRole) : false;
    }

    it('should validate admin permissions', () => {
      const adminRole: UserRole = 'admin';
      
      // Admin should have all permissions
      expect(hasPermission(PERMISSIONS.DASHBOARD_ACCESS, adminRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.ANALYTICS_VIEW, adminRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.USERS_MANAGE, adminRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.BLOG_MANAGE, adminRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.PROPERTIES_MANAGE, adminRole)).toBe(true);
    });

    it('should validate agent permissions', () => {
      const agentRole: UserRole = 'agent';
      
      // Agent should have limited permissions
      expect(hasPermission(PERMISSIONS.DASHBOARD_ACCESS, agentRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.PROPERTIES_MANAGE, agentRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.LANDS_MANAGE, agentRole)).toBe(true);
      
      // Agent should NOT have these permissions
      expect(hasPermission(PERMISSIONS.ANALYTICS_VIEW, agentRole)).toBe(false);
      expect(hasPermission(PERMISSIONS.USERS_MANAGE, agentRole)).toBe(false);
      expect(hasPermission(PERMISSIONS.BLOG_MANAGE, agentRole)).toBe(false);
    });

    it('should validate user permissions', () => {
      const userRole: UserRole = 'user';
      
      // User should have basic permissions
      expect(hasPermission(PERMISSIONS.PROPERTIES_VIEW, userRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.LANDS_VIEW, userRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.BLOG_VIEW, userRole)).toBe(true);
      expect(hasPermission(PERMISSIONS.PROFILE_ACCESS, userRole)).toBe(true);
      
      // User should NOT have management permissions
      expect(hasPermission(PERMISSIONS.DASHBOARD_ACCESS, userRole)).toBe(false);
      expect(hasPermission(PERMISSIONS.PROPERTIES_MANAGE, userRole)).toBe(false);
      expect(hasPermission(PERMISSIONS.USERS_MANAGE, userRole)).toBe(false);
    });
  });

  describe('Route Access Control', () => {
    function canAccessRoute(route: string, userRole: UserRole): boolean {
      const requiredPermission = getRequiredPermission(route);
      if (!requiredPermission) {
        return true; // No specific permission required
      }
      
      const allowedRoles = adminConfig.permissions[requiredPermission];
      return allowedRoles ? allowedRoles.includes(userRole) : false;
    }

    it('should control dashboard access correctly', () => {
      expect(canAccessRoute('/dashboard', 'admin')).toBe(true);
      expect(canAccessRoute('/dashboard', 'agent')).toBe(true);
      expect(canAccessRoute('/dashboard', 'user')).toBe(false);
    });

    it('should control admin-only routes', () => {
      expect(canAccessRoute('/dashboard/users', 'admin')).toBe(true);
      expect(canAccessRoute('/dashboard/users', 'agent')).toBe(false);
      expect(canAccessRoute('/dashboard/users', 'user')).toBe(false);
      
      expect(canAccessRoute('/dashboard/analytics', 'admin')).toBe(true);
      expect(canAccessRoute('/dashboard/analytics', 'agent')).toBe(false);
      expect(canAccessRoute('/dashboard/analytics', 'user')).toBe(false);
    });

    it('should allow profile access for all roles', () => {
      expect(canAccessRoute('/profile', 'admin')).toBe(true);
      expect(canAccessRoute('/profile', 'agent')).toBe(true);
      expect(canAccessRoute('/profile', 'user')).toBe(true);
    });

    it('should handle routes without specific permissions', () => {
      expect(canAccessRoute('/unknown-route', 'admin')).toBe(true);
      expect(canAccessRoute('/unknown-route', 'agent')).toBe(true);
      expect(canAccessRoute('/unknown-route', 'user')).toBe(true);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle invalid routes gracefully', () => {
      expect(getRequiredPermission('')).toBeNull();
      expect(getRequiredPermission('//')).toBeNull();
      expect(getRequiredPermission('/nonexistent')).toBeNull();
    });

    it('should handle invalid user roles', () => {
      // TypeScript should prevent this, but test runtime behavior
      expect(shouldRedirectUser('/dashboard', 'invalid' as UserRole)).toBeNull();
      expect(shouldRedirectUser('/profile', 'unknown' as UserRole)).toBeNull();
    });

    it('should prioritize most specific route permissions', () => {
      // More specific routes should take precedence
      expect(getRequiredPermission('/dashboard/properties/create')).toBe(PERMISSIONS.PROPERTIES_MANAGE);
      expect(getRequiredPermission('/profile/settings/security')).toBe(PERMISSIONS.PROFILE_MANAGE);
    });

    it('should maintain consistent permission structure', () => {
      // Ensure all permissions are properly defined
      const allPermissions = Object.values(PERMISSIONS);
      const configPermissions = Object.keys(adminConfig.permissions);
      
      allPermissions.forEach(permission => {
        expect(configPermissions).toContain(permission);
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complete user journey - Admin', () => {
      const adminRole: UserRole = 'admin';
      
      // Admin signs in and should be redirected to dashboard
      expect(getRedirectUrlForRole(adminRole)).toBe('/dashboard');
      
      // Admin can access all dashboard features
      expect(canAccessRoute('/dashboard', adminRole)).toBe(true);
      expect(canAccessRoute('/dashboard/properties', adminRole)).toBe(true);
      expect(canAccessRoute('/dashboard/users', adminRole)).toBe(true);
      expect(canAccessRoute('/dashboard/analytics', adminRole)).toBe(true);
      
      // Admin trying to access profile gets redirected to dashboard
      expect(shouldRedirectUser('/profile', adminRole)).toBe('/dashboard');
    });

    it('should handle complete user journey - Agent', () => {
      const agentRole: UserRole = 'agent';
      
      // Agent signs in and should be redirected to dashboard
      expect(getRedirectUrlForRole(agentRole)).toBe('/dashboard');
      
      // Agent can access limited dashboard features
      expect(canAccessRoute('/dashboard', agentRole)).toBe(true);
      expect(canAccessRoute('/dashboard/properties', agentRole)).toBe(true);
      expect(canAccessRoute('/dashboard/lands', agentRole)).toBe(true);
      
      // Agent cannot access admin-only features
      expect(canAccessRoute('/dashboard/users', agentRole)).toBe(false);
      expect(canAccessRoute('/dashboard/analytics', agentRole)).toBe(false);
      
      // Agent trying to access profile gets redirected to dashboard
      expect(shouldRedirectUser('/profile', agentRole)).toBe('/dashboard');
    });

    it('should handle complete user journey - User', () => {
      const userRole: UserRole = 'user';
      
      // User signs in and should be redirected to profile
      expect(getRedirectUrlForRole(userRole)).toBe('/profile');
      
      // User can access profile features
      expect(canAccessRoute('/profile', userRole)).toBe(true);
      expect(canAccessRoute('/profile/settings', userRole)).toBe(true);
      
      // User cannot access dashboard
      expect(canAccessRoute('/dashboard', userRole)).toBe(false);
      
      // User trying to access dashboard gets redirected to profile
      expect(shouldRedirectUser('/dashboard', userRole)).toBe('/profile');
      
      // User can access public content
      expect(isPublicRoute('/properties')).toBe(true);
      expect(isPublicRoute('/blog')).toBe(true);
    });
  });

  function canAccessRoute(route: string, userRole: UserRole): boolean {
    const requiredPermission = getRequiredPermission(route);
    if (!requiredPermission) {
      return true; // No specific permission required
    }
    
    const allowedRoles = adminConfig.permissions[requiredPermission];
    return allowedRoles ? allowedRoles.includes(userRole) : false;
  }
});