import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Explore from '../Explore';
import userEvent from '@testing-library/user-event';
import * as observationsService from '../../services/observationsService';

vi.mock('../../services/observationsService', () => ({
  getObservationsPage: vi.fn(),
  likeObservation: vi.fn(),
}));

vi.mock('../Map', () => ({
  default: () => <div data-testid="explore-map" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const real = await importOriginal<typeof import('react-router-dom')>();
  return { ...real, useNavigate: () => mockNavigate };
});



const mockObservation = {
  id: 1,
  user: 'potato',
  userProfilePicture: null,
  timestamp: '2024-01-01T10:00:00Z',
  speciesName: 'Quercus coccifera',
  speciesId: 42,
  location: 'Amman, Jordan',
  image: { thumbnail: 'https://example.com/img.jpg', image: 'https://example.com/img.jpg' },
  images: [],
  description: 'A beautiful oak tree',
  confidenceLevel: 0.95,
  verified: true,
  latitude: 31.8,
  longitude: 35.9,
  likes: 10,
  comments: 3,
  hasLiked: false,
  assignedQuest: null,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );


describe('Explore page', () => {
  let triggerIntersection: ((entries: { isIntersecting: boolean }[]) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    triggerIntersection = null;
    mockNavigate.mockReset();

    window.IntersectionObserver = vi.fn((callback) => {
      triggerIntersection = callback;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    }) as any;
  });

  it('renders observation cards with species name, author, counts, and badges', async () => {
    (observationsService.getObservationsPage as any).mockResolvedValue({
      observations: [mockObservation],
      nextPage: null,
    });

    renderWithProviders(<Explore />);

    expect(await screen.findAllByText('Quercus coccifera')).not.toHaveLength(0);
    expect(screen.getAllByText('potato')).not.toHaveLength(0);
    expect(screen.getAllByText('A beautiful oak tree')).not.toHaveLength(0);
    expect(screen.getAllByText('Amman, Jordan')).not.toHaveLength(0);
    expect(screen.getAllByText('Verified')).not.toHaveLength(0);

    expect(screen.getAllByRole('button', { name: '10' })).toHaveLength(2); // 2 layouts × 1 card
    expect(screen.getAllByRole('button', { name: '3' })).toHaveLength(2);
  });

  it('navigates to observation detail when a card is clicked', async () => {
    (observationsService.getObservationsPage as any).mockResolvedValue({
      observations: [mockObservation],
      nextPage: null,
    });

    renderWithProviders(<Explore />);
    const user = userEvent.setup();

    await screen.findAllByText('Quercus coccifera');
    await user.click(screen.getAllByRole('article')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/observations/1');
  });

  it('fetches and shows the next page when the scroll sentinel enters the viewport', async () => {
    const obs2 = { ...mockObservation, id: 2, speciesName: 'Rosa canina' };
    (observationsService.getObservationsPage as any)
      .mockResolvedValueOnce({ observations: [mockObservation], nextPage: 2 })
      .mockResolvedValueOnce({ observations: [obs2], nextPage: null });

    renderWithProviders(<Explore />);

    await screen.findAllByText('Quercus coccifera');

    act(() => {
      triggerIntersection?.([{ isIntersecting: true }]);
    });

    expect(await screen.findAllByText('Rosa canina')).not.toHaveLength(0);
  });

  it('immediately increases the like count and calls likeObservation when heart is clicked', async () => {
    (observationsService.getObservationsPage as any).mockResolvedValue({
      observations: [mockObservation], // hasLiked: false, likes: 10
      nextPage: null,
    });
    (observationsService.likeObservation as any).mockResolvedValue({
      has_liked: true,
      likes_count: 11,
    });

    renderWithProviders(<Explore />);
    const user = userEvent.setup();

    await screen.findAllByText('Quercus coccifera');

    await user.click(screen.getAllByRole('button', { name: '10' })[0]);
    expect(await screen.findAllByRole('button', { name: '11' })).not.toHaveLength(0);
    expect(observationsService.likeObservation).toHaveBeenCalledWith(1);
  });
});
