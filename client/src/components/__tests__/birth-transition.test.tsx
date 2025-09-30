import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BirthTransition from '../pregnancy/birth-transition';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock dependencies
jest.mock('wouter', () => ({
  useLocation: () => ["/pregnancy", jest.fn()]
}));

// Mock confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Test Baby' }),
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('BirthTransition component - Full User Journey', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('completes the full birth transition flow', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BirthTransition pregnancyId={1} onClose={mockOnClose} />
      </QueryClientProvider>
    );
    
    // Step 1: Baby Name
    
    // Check first step is rendered
    expect(screen.getByText("Welcome to the World!")).toBeInTheDocument();
    
    // Enter baby name
    const nameInput = screen.getByLabelText("Baby's Name");
    fireEvent.change(nameInput, { target: { value: 'Test Baby' } });
    
    // Select gender
    const genderSelect = screen.getByText("Select gender");
    fireEvent.click(genderSelect);
    fireEvent.click(screen.getByText("Female"));
    
    // Continue to next step
    fireEvent.click(screen.getByText("Continue"));
    
    // Step 2: Birth Date & Time
    
    // Wait for step 2 to render
    await waitFor(() => {
      expect(screen.getByText("Birth Details")).toBeInTheDocument();
    });
    
    // Enter birth date (keep default)
    
    // Click Complete
    fireEvent.click(screen.getByText("Complete"));
    
    // Wait for final step (success screen)
    await waitFor(() => {
      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });
    
    // Verify success elements
    expect(screen.getByText(/Welcome to the world, Test Baby/)).toBeInTheDocument();
    expect(screen.getByText("Baby profile created")).toBeInTheDocument();
    expect(screen.getByText("Pregnancy records archived")).toBeInTheDocument();
  });
  
  it('shows validation error when continuing without name', () => {
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
  
  it('can go back from step 2 to step 1', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BirthTransition pregnancyId={1} onClose={mockOnClose} />
      </QueryClientProvider>
    );
    
    // Enter baby name and proceed to step 2
    fireEvent.change(screen.getByLabelText("Baby's Name"), { target: { value: 'Test Baby' } });
    fireEvent.click(screen.getByText("Continue"));
    
    // Wait for step 2
    await waitFor(() => {
      expect(screen.getByText("Birth Details")).toBeInTheDocument();
    });
    
    // Click back
    fireEvent.click(screen.getByText("Back"));
    
    // Should be on step 1 again
    expect(screen.getByText("Welcome to the World!")).toBeInTheDocument();
    
    // Name should be preserved
    expect(screen.getByLabelText("Baby's Name")).toHaveValue('Test Baby');
  });
});
