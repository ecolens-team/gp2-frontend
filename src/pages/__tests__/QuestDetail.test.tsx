import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestDetail from '../QuestDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as questService from '../../services/questService';
import toast from 'react-hot-toast';

// Mock the quest service
vi.mock('../../services/questService', () => ({
  getQuestById: vi.fn(),
  joinQuest: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

import { UIProvider } from '../../contexts/UIContext';

// ... (existing mocks)

const renderWithProviders = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <MemoryRouter initialEntries={['/quests/1']}>
          <Routes>
            <Route path='/quests/:id' element={<QuestDetail />} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>,
  );
};

describe('QuestDetail Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', async () => {
    (questService.getQuestById as any).mockReturnValue(new Promise(() => {}));
    renderWithProviders();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders quest details when data is fetched', async () => {
    const mockQuest = {
      id: '1',
      title: 'Test Detailed Quest',
      description: 'Detailed Description',
      rules: 'Some rules',
      rewardPts: 500,
      progressPercent: 30,
      category: 'PLANT',
      isJoined: true,
      recent_submissions: [
        {
          id: 's1',
          images: [{ thumbnail: 'img1.jpg' }],
          user: { username: 'user1' },
          timestamp: '2023-01-01',
        },
      ],
      totalParticipants: 10,
    };
    (questService.getQuestById as any).mockResolvedValue(mockQuest);

    renderWithProviders();

    expect(await screen.findByText('Test Detailed Quest')).toBeInTheDocument();
    expect(screen.getByText('Detailed Description')).toBeInTheDocument();
    expect(screen.getByText('Some rules')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('@user1')).toBeInTheDocument();
  });

  it('handles joining a quest', async () => {
    const mockQuest = {
      id: '1',
      title: 'Test Quest',
      description: 'Description',
      rewardPts: 500,
      progressPercent: 0,
      category: 'PLANT',
      isJoined: false,
    };
    (questService.getQuestById as any).mockResolvedValue(mockQuest);
    (questService.joinQuest as any).mockResolvedValue(undefined);

    renderWithProviders();

    const joinButton = await screen.findByRole('button', {
      name: /join quest/i,
    });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(questService.joinQuest).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Joined quest successfully!');
    });
  });

  it('renders error state when quest not found', async () => {
    (questService.getQuestById as any).mockRejectedValue(
      new Error('Not found'),
    );

    renderWithProviders();

    expect(await screen.findByText('Quest not found')).toBeInTheDocument();
  });
});
