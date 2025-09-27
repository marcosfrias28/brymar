import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced mobile detection with more granular breakpoints
export function useEnhancedMobile() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet'
  }
}
