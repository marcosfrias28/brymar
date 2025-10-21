/**
 * Mobile detection hooks - simplified interface
 * Re-exports from the comprehensive mobile-responsive hooks
 */

import { useResponsive } from './use-mobile-responsive';

export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

// Enhanced mobile detection with more granular breakpoints
export function useEnhancedMobile() {
  const responsive = useResponsive();
  return {
    breakpoint: responsive.breakpoint,
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    isMobileOrTablet: responsive.isMobile || responsive.isTablet
  };
}
