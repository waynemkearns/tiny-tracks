import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedTimeline from '../unified-timeline';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock the API responses
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query');
  return {
    ...originalModule,
    useQuery: jest.fn().mockImplementation(({ queryKey, placeholderData }) => {
      // Return mock data based on the query key
      if (queryKey?.includes('contractions')) {
        return { data: mockContractions };
      } 
      else if (queryKey?.includes('movements')) {
        return { data: mockMovements };
      }
      else if (queryKey?.includes('feeds')) {
        return { data: mockFeeds };
      }
      else if (queryKey?.includes('pregnancy')) {
        return { data: mockPregnancy };
      }
      else if (queryKey?.includes('baby')) {
        return { data: mockBaby };
      }
      return { data: placeholderData || null };
    }),
  };
});

// Mock data
const mockPregnancy = {
  id: 1,
  userId: 1,
  estimatedDueDate: "2023-12-01T00:00:00Z"
};

const mockBaby = {
  id: 1,
  name: "Test Baby",
  birthDate: "2023-12-01T00:00:00Z"
};

const mockContractions = [
  {
    id: 1,
    pregnancyId: 1,
    startTime: "2023-11-30T12:00:00Z",
    endTime: "2023-11-30T12:05:00Z",
    duration: 300,
    intensity: 5
  },
  {
    id: 2,
    pregnancyId: 1,
    startTime: "2023-11-30T12:15:00Z",
    endTime: "2023-11-30T12:20:00Z",
    duration: 300,
    intensity: 6
  }
];

const mockMovements = [
  {
    id: 1,
    pregnancyId: 1,
    timestamp: "2023-11-29T08:00:00Z",
    duration: 10,
    responseToStimuli: "food"
  }
];

const mockFeeds = [
  {
    id: 1,
    babyId: 1,
    type: "bottle",
    amount: 120,
    timestamp: "2023-12-01T14:00:00Z"
  }
];

// Setup query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('UnifiedTimeline component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the timeline with correct data', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UnifiedTimeline 
          userId={1}
          pregnancyId={1}
          babyId={1}
          showPregnancy={true}
          showBaby={true}
        />
      </QueryClientProvider>
    );
    
    // Check timeline title is displayed
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    
    // Check for filters button
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    
    // Check pregnancy events are shown
    expect(screen.getByText('Contraction')).toBeInTheDocument();
    expect(screen.getByText('Fetal Movement')).toBeInTheDocument();
    
    // Check baby events are shown
    expect(screen.getByText('Bottle Feed')).toBeInTheDocument();
  });
  
  it('applies filters correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UnifiedTimeline 
          userId={1}
          pregnancyId={1}
          babyId={1}
          showPregnancy={true}
          showBaby={true}
        />
      </QueryClientProvider>
    );
    
    // Open filters
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    
    // Toggle off pregnancy events
    const pregnancyCheckbox = screen.getByLabelText('Pregnancy Events');
    fireEvent.click(pregnancyCheckbox);
    
    // The pregnancy events should no longer be visible
    expect(screen.queryByText('Contraction')).not.toBeInTheDocument();
    
    // But baby events should still be visible
    expect(screen.getByText('Bottle Feed')).toBeInTheDocument();
  });
  
  it('shows empty state when no events match filters', () => {
    // Mock all data as empty
    jest.mock('@tanstack/react-query', () => {
      return {
        useQuery: () => ({ data: [] }),
        QueryClientProvider: ({ children }) => children,
      };
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UnifiedTimeline 
          userId={1}
          pregnancyId={1}
          babyId={1}
          showPregnancy={false}
          showBaby={false}
        />
      </QueryClientProvider>
    );
    
    // Check empty state is shown
    expect(screen.getByText('No timeline events to display')).toBeInTheDocument();
  });
});
