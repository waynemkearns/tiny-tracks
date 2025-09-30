import { analytics, EventCategory } from '../analytics';
import * as Sentry from '@sentry/react';

// Mock Sentry
jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Analytics service', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock window.plausible
    window.plausible = jest.fn();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clean up window.plausible
    delete window.plausible;
  });
  
  it('tracks page views correctly', () => {
    // Call the pageView method
    analytics.pageView('/test-page');
    
    // Check that Plausible was called
    expect(window.plausible).toHaveBeenCalledWith('pageview', {
      props: { path: '/test-page' }
    });
    
    // Check that Sentry breadcrumb was added
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: 'Page viewed: /test-page',
      level: 'info'
    });
    
    // Check console log in development mode
    expect(console.log).toHaveBeenCalled();
  });
  
  it('tracks events correctly', () => {
    // Event data
    const action = 'test_event';
    const category = EventCategory.Feature;
    const data = { feature: 'birth_transition', step: 1 };
    
    // Call the trackEvent method
    analytics.trackEvent(action, category, data);
    
    // Check that Plausible was called
    expect(window.plausible).toHaveBeenCalledWith('test_event', {
      props: { 
        category,
        feature: 'birth_transition',
        step: 1
      }
    });
    
    // Check that Sentry breadcrumb was added
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category,
      message: action,
      data,
      level: 'info'
    });
  });
  
  it('tracks errors correctly', () => {
    // Create an error
    const error = new Error('Test error');
    const context = { component: 'BirthTransition' };
    
    // Call the trackError method
    analytics.trackError(error, context);
    
    // Check that Sentry captureException was called
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: context
    });
  });
  
  it('identifies users correctly', () => {
    // Call the identifyUser method
    analytics.identifyUser('user-123', { role: 'parent' });
    
    // Check that Sentry setUser was called
    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: 'user-123',
      role: 'parent'
    });
  });
  
  it('clears user data correctly', () => {
    // Call the clearUser method
    analytics.clearUser();
    
    // Check that Sentry setUser was called with null
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });
  
  it('handles errors during tracking gracefully', () => {
    // Make window.plausible throw an error
    window.plausible = jest.fn().mockImplementation(() => {
      throw new Error('Plausible error');
    });
    
    // This should not throw
    expect(() => {
      analytics.pageView('/error-page');
    }).not.toThrow();
    
    // Error should be logged
    expect(console.error).toHaveBeenCalled();
  });
});
