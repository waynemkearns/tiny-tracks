import { render, screen, fireEvent } from '@testing-library/react';
import BirthTransition from '../birth-transition';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock dependencies
jest.mock('wouter', () => ({
  useLocation: () => ["/pregnancy", jest.fn()]
}));

// Mock confetti
jest.mock('canvas-confetti', () => jest.fn());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('BirthTransition component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly with initial step', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BirthTransition pregnancyId={1} onClose={mockOnClose} />
      </QueryClientProvider>
    );
    
    // Check first step is rendered
    expect(screen.getByText("Welcome to the World!")).toBeInTheDocument();
    expect(screen.getByLabelText("Baby's Name")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });
  
  it('shows validation error when continuing without name', () => {
    // Mock the toast function
    const mockToast = jest.fn();
    jest.mock('@/hooks/use-toast', () => ({
      useToast: () => ({ toast: mockToast })
    }));
    
    render(
      <QueryClientProvider client={queryClient}>
        <BirthTransition pregnancyId={1} onClose={mockOnClose} />
      </QueryClientProvider>
    );
    
    // Try to continue without entering a name
    fireEvent.click(screen.getByText("Continue"));
    
    // Should still be on step 1 (name would be visible)
    expect(screen.getByLabelText("Baby's Name")).toBeInTheDocument();
  });
  
  it('allows closing the modal', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BirthTransition pregnancyId={1} onClose={mockOnClose} />
      </QueryClientProvider>
    );
    
    // Click the close button
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
