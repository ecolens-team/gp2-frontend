import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Quests from '../Quests';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import * as questService from '../../services/questService';

// Mock the quest service
vi.mock('../../services/questService', () => ({
  getQuests: vi.fn(),
  getGamificationProfile: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Quests Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', async () => {
    (questService.getQuests as any).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Quests />);
    // Since Spinner is used, we look for it.
    // Our Spinner component has a class "animate-spin" and an icon.
    // Let's just check if it renders.
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders quest list when data is fetched', async () => {
    const mockQuests = [
      {
        id: '1',
        title: 'Test Quest 1',
        description: 'Description 1',
        rewardPts: 100,
        progressPercent: 50,
        category: 'PLANT',
        isJoined: true,
      },
      {
        id: '2',
        title: 'Test Quest 2',
        description: 'Description 2',
        rewardPts: 200,
        progressPercent: 0,
        category: 'INSECT',
        isJoined: false,
      },
    ];
    (questService.getQuests as any).mockResolvedValue(mockQuests);

    renderWithProviders(<Quests />);

    expect(await screen.findByText('Test Quest 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Quest 2')).toBeInTheDocument();
    expect(screen.getByText('Active Quests')).toBeInTheDocument();
    expect(screen.getByText('New Adventures')).toBeInTheDocument();
  });

  it('renders empty state when no quests are returned', async () => {
    (questService.getQuests as any).mockResolvedValue([]);

    renderWithProviders(<Quests />);

    expect(await screen.findByText('No Quests Active')).toBeInTheDocument();
    expect(screen.getByText('Check back later for new biodiversity challenges!')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch';
    (questService.getQuests as any).mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<Quests />);

    expect(await screen.findByText('Error Loading Quests')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
