import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ObservationDetail from '../Observationdetail';
import userEvent from '@testing-library/user-event';
import * as observationsService from '../../services/observationsService';
import * as questService from '../../services/questService';


vi.mock('../../services/observationsService', () => ({
  getObservationById: vi.fn(),
  getObservationComments: vi.fn(),
  getSpeciesList: vi.fn(),
  createObservationComment: vi.fn(),
  verifyObservation: vi.fn(),
}));

vi.mock('../../services/questService', () => ({
  getQuests: vi.fn(),
  submitObservationToQuest: vi.fn(),
}));

let mockAuthUser: { username: string; role: string } | null = {
  username: 'heba',
  role: 'USER',
};

vi.mock('../../contexts/AuthContext/AuthContext', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../contexts/AuthContext/AuthContext')>();
  return {
    ...real,
    useAuth: () => ({ authUser: mockAuthUser, login: vi.fn(), logout: vi.fn() }),
  };
});


vi.mock('../../contexts/UIContext', () => ({
  usePageLayout: vi.fn(),
}));

vi.mock('react-map-gl/mapbox', () => ({
  Map: ({ children, initialViewState }: any) => (
    <div
      data-testid="mapbox-map"
      data-lat={initialViewState?.latitude}
      data-lng={initialViewState?.longitude}
    >
      {children}
    </div>
  ),
  Marker: ({ latitude, longitude, children }: any) => (
    <div data-testid="mapbox-marker" data-lat={latitude} data-lng={longitude}>
      {children}
    </div>
  ),
  FullscreenControl: () => null,
  NavigationControl: () => null,
}));

vi.mock('react-select', () => ({
  default: ({ options, onChange, placeholder }: any) => (
    <select
      aria-label={placeholder ?? 'select'}
      onChange={e => {
        const opt = options?.find((o: any) => o.value === e.target.value);
        onChange(opt ?? null);
      }}
    >
      <option value="">—</option>
      {options?.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  ),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../components/ObservationImageCarousel', () => ({
  default: () => <div data-testid="image-carousel" />,
}));

vi.mock('../../components/ui/PickerModal', () => ({
  PickerModal: () => null,
  PickerTrigger: ({ label }: any) => <button type="button">{label}</button>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const real = await importOriginal<typeof import('react-router-dom')>();
  return { ...real, useNavigate: () => mockNavigate };
});


const mockObservation = {
  id: 42,
  user: 'heba',
  userProfilePicture: null,
  timestamp: '2024-01-01T10:00:00Z',
  speciesName: 'Quercus coccifera',
  speciesId: 7,
  location: 'Amman, Jordan', // truthy → Marker is rendered
  image: { thumbnail: 'https://example.com/img.jpg' },
  images: [{ image: 'https://example.com/img.jpg' }],
  description: 'A scrub oak specimen',
  confidenceLevel: 0.88,
  verified: false,
  latitude: 31.8,
  longitude: 35.9,
  likes: 5,
  comments: 2,
  hasLiked: false,
  assignedQuest: null,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderObservationDetail = (id: number) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/observations/${id}`]}>
        <Routes>
          <Route path="/observations/:id" element={<ObservationDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('ObservationDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockNavigate.mockReset();
    mockAuthUser = { username: 'potato', role: 'USER' };

    (observationsService.getObservationById as any).mockResolvedValue(mockObservation);
    (observationsService.getObservationComments as any).mockResolvedValue([]);
    (questService.getQuests as any).mockResolvedValue([]);
  });

  it('navigates to the species page when the species name link is clicked', async () => {
    renderObservationDetail(42);
    const user = userEvent.setup();

    const speciesLink = await screen.findByRole('button', { name: /Quercus coccifera/i });
    await user.click(speciesLink);

    expect(mockNavigate).toHaveBeenCalledWith('/species/7');
  });

  it('renders the map centered on the observation location with a pin', async () => {
    renderObservationDetail(42);

    await screen.findByText('Quercus coccifera');

    const map = screen.getByTestId('mapbox-map');
    expect(map).toHaveAttribute('data-lat', '31.8');
    expect(map).toHaveAttribute('data-lng', '35.9');

    const marker = screen.getByTestId('mapbox-marker');
    expect(marker).toHaveAttribute('data-lat', '31.8');
    expect(marker).toHaveAttribute('data-lng', '35.9');
  });

  // ── 3a. Quest section visible on own observation ───────────────────────────
  it("shows the Quest Assignment section when viewing one's own observation", async () => {
    // mockAuthUser.username ('heba') matches mockObservation.user ('heba') → isOwner = true
    renderObservationDetail(42);

    await screen.findByText('Quercus coccifera');

    expect(screen.getByText('Quest Assignment')).toBeInTheDocument();
    // No joined quests → shows the "join a quest" hint instead of a picker
    expect(screen.getByText('Join a quest to assign this observation.')).toBeInTheDocument();
  });

  // ── 3b. Quest section hidden on other users' observations ──────────────────
  it("hides the Quest Assignment section when viewing another user's observation", async () => {
    mockAuthUser = { username: 'alice', role: 'USER' }; // different from observation.user

    renderObservationDetail(42);
    await screen.findByText('Quercus coccifera');

    expect(screen.queryByText('Quest Assignment')).not.toBeInTheDocument();
  });

  it('shows the quest picker trigger when user has joined quests', async () => {
    (questService.getQuests as any).mockResolvedValue([
      { id: '1', title: ' Survey', isJoined: true, rewardPts: 100, progressPercent: 0, category: 'INSECT', description: '' },
    ]);

    renderObservationDetail(42);
    await screen.findByText('Quercus coccifera');

    expect(screen.getByRole('button', { name: /add to quest/i })).toBeInTheDocument();
  });

  it('calls createObservationComment with the typed text when Post is clicked', async () => {
    (observationsService.createObservationComment as any).mockResolvedValue({
      id: 1, user: 'heba', text: 'Nice find!', createdAt: '2024-01-01',
    });

    (observationsService.getObservationComments as any).mockResolvedValue([]);

    renderObservationDetail(42);
    const user = userEvent.setup();

    await screen.findByText('Quercus coccifera');

    await user.type(screen.getByPlaceholderText('Add a comment...'), 'Nice find!');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(observationsService.createObservationComment).toHaveBeenCalledWith(42, {
      content: 'Nice find!',
    });
  });
});
