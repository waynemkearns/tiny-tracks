import * as Sentry from '@sentry/react';
import { envConfig } from './env';

// Initialize Sentry in production only
if (envConfig.isProduction) {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN", // Replace with your actual Sentry DSN
    integrations: [],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Set environment
    environment: envConfig.isProduction ? 'production' : 'development',
    
    // Only enable in production
    enabled: envConfig.isProduction,
    
    // Don't capture personal data
    beforeSend(event) {
      // Remove PII if needed
      return event;
    }
  });
}

// Define event categories
export enum EventCategory {
  Navigation = 'navigation',
  Engagement = 'engagement',
  Tracking = 'tracking',
  Feature = 'feature',
  Error = 'error',
}

// Analytics service
export const analytics = {
  // Track page views
  pageView(path: string): void {
    try {
      // Track with Plausible if it exists (script would be added via HTML)
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('pageview', { props: { path } });
      }

      // Also track in Sentry for user flows
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Page viewed: ${path}`,
        level: 'info'
      });

      // Log in development for testing
      if (envConfig.isDevelopment) {
        console.log(`[Analytics] Page view: ${path}`);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error);
    }
  },

  // Track custom events
  trackEvent(action: string, category: EventCategory, data: Record<string, any> = {}): void {
    try {
      // Track with Plausible if available
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(action, { 
          props: { 
            category,
            ...data
          }
        });
      }

      // Add breadcrumb to Sentry
      Sentry.addBreadcrumb({
        category,
        message: action,
        data,
        level: 'info'
      });

      // Log in development
      if (envConfig.isDevelopment) {
        console.log(`[Analytics] Event: ${action}`, { category, ...data });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  },

  // Track errors
  trackError(error: Error, context: Record<string, any> = {}): void {
    try {
      // Send to Sentry
      Sentry.captureException(error, {
        extra: context
      });

      // Log in development
      if (envConfig.isDevelopment) {
        console.error('[Analytics] Error tracked:', error, context);
      }
    } catch (err) {
      console.error('[Analytics] Error while tracking error:', err);
    }
  },

  // Set user information
  identifyUser(userId: string, traits: Record<string, any> = {}): void {
    try {
      // Set user in Sentry
      Sentry.setUser({
        id: userId,
        ...traits
      });

      if (envConfig.isDevelopment) {
        console.log(`[Analytics] User identified: ${userId}`, traits);
      }
    } catch (error) {
      console.error('[Analytics] Error identifying user:', error);
    }
  },

  // Clear user information on logout
  clearUser(): void {
    Sentry.setUser(null);
  }
};

// Type for window.plausible
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

// Export Sentry for direct use if needed
export { Sentry };
