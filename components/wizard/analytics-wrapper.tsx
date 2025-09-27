"use client";

import React, { useEffect, useRef } from "react";
import { useWizardAnalytics } from "@/hooks/use-wizard-analytics";

interface AnalyticsWrapperProps {
  children: React.ReactNode;
  stepNumber?: number;
  componentName: string;
  trackInteractions?: boolean;
  trackPerformance?: boolean;
}

export function AnalyticsWrapper({
  children,
  stepNumber,
  componentName,
  trackInteractions = true,
  trackPerformance = true,
}: AnalyticsWrapperProps) {
  const analytics = useWizardAnalytics({
    trackPerformance,
    trackUserBehavior: trackInteractions,
  });

  const componentMountTime = useRef<number>(Date.now());
  const performanceEnd = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Track component mount performance
    if (trackPerformance) {
      performanceEnd.current = analytics.measurePerformance(
        `${componentName}_render`
      );
    }

    // Track component mount
    analytics.trackPerformanceMetric({
      metricName: `${componentName}_mounted`,
      value: Date.now() - componentMountTime.current,
      unit: "ms",
      context: { stepNumber },
    });

    return () => {
      // Track component unmount
      if (performanceEnd.current) {
        performanceEnd.current();
      }

      const mountDuration = Date.now() - componentMountTime.current;
      analytics.trackPerformanceMetric({
        metricName: `${componentName}_lifetime`,
        value: mountDuration,
        unit: "ms",
        context: { stepNumber },
      });
    };
  }, [analytics, componentName, stepNumber, trackPerformance]);

  // Error boundary functionality
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        component: componentName,
        stepNumber,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        {
          component: componentName,
          stepNumber,
          reason: event.reason,
        }
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [analytics, componentName, stepNumber]);

  return (
    <div
      data-analytics-component={componentName}
      data-analytics-step={stepNumber}
    >
      {children}
    </div>
  );
}

// HOC for wrapping components with analytics
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  options: {
    stepNumber?: number;
    trackInteractions?: boolean;
    trackPerformance?: boolean;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <AnalyticsWrapper
        componentName={componentName}
        stepNumber={options.stepNumber}
        trackInteractions={options.trackInteractions}
        trackPerformance={options.trackPerformance}
      >
        <Component {...props} />
      </AnalyticsWrapper>
    );
  };

  WrappedComponent.displayName = `withAnalytics(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
