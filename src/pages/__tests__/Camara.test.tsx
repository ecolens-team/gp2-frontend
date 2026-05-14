import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AddObservation from '../Camera';
import userEvent from '@testing-library/user-event';
import * as observationsService from '../../services/observationsService';
import * as questService from '../../services/questService';
import toast from 'react-hot-toast';


vi.mock('../../services/observationsService', () => ({
  createObservation: vi.fn(),
  predictSpecies: vi.fn(),
}));

vi.mock('../../services/questService', () => ({
  getQuests: vi.fn(),
  submitObservationToQuest: vi.fn(),
}));

vi.mock('../../contexts/UIContext', () => ({
  usePageLayout: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));


vi.mock('@shivantra/react-web-camera', async () => {
  const React = await import('react');
  return {
    WebCamera: React.forwardRef((_props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        capture: vi.fn(),
        switch: vi.fn(),
      }));
      return <div data-testid="web-camera">Camera Preview</div>;
    }),
  };
});


vi.mock('react-map-gl/mapbox', () => ({
  default: ({ children, onClick }: any) => (
    <div data-testid="mapbox-map">
      <button
        type="button"
        onClick={() => onClick?.({ lngLat: { lat: 31.8, lng: 35.9 } })}
      >
        Set Location
      </button>
      {children}
    </div>
  ),
  Map: ({ children, onClick }: any) => (
    <div data-testid="mapbox-map">
      <button
        type="button"
        onClick={() => onClick?.({ lngLat: { lat: 31.8, lng: 35.9 } })}
      >
        Set Location
      </button>
      {children}
    </div>
  ),
  Marker: ({ children }: any) => <div data-testid="mapbox-marker">{children}</div>,
  GeolocateControl: () => null,
  NavigationControl: () => null,
  FullscreenControl: () => null,
}));

vi.mock('../../components/ui/PickerModal', () => ({
  PickerModal: () => null,
  PickerTrigger: ({ label }: any) => <button type="button">{label}</button>,
}));


global.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
global.URL.revokeObjectURL = vi.fn();


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );


const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};


describe('Camera / AddObservation page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    (questService.getQuests as any).mockResolvedValue([]);
  });

  it('starts in camera view on mobile (width ≤ 768)', () => {
    setWindowWidth(375);
    renderWithProviders(<AddObservation />);
    expect(screen.getByTestId('web-camera')).toBeInTheDocument();
    expect(screen.queryByText('Upload images')).not.toBeInTheDocument();
  });

  it('starts in details/upload view on desktop (width > 768)', () => {
    setWindowWidth(1280);
    renderWithProviders(<AddObservation />);
    expect(screen.getByText('Upload images')).toBeInTheDocument();
    expect(screen.queryByTestId('web-camera')).not.toBeInTheDocument();
  });

  it('runs AI prediction after a file is uploaded and shows the predicted species', async () => {
    setWindowWidth(1280);
    (observationsService.predictSpecies as any).mockResolvedValue({
      species: 'Quercus coccifera',
      confidence: 0.93,
    });

    renderWithProviders(<AddObservation />);
    const user = userEvent.setup();

    const file = new File(['img-data'], 'plant.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    await user.upload(fileInput, file);

    expect(observationsService.predictSpecies).toHaveBeenCalledWith(file);
    expect(await screen.findByText('Quercus coccifera')).toBeInTheDocument();
    expect(screen.getByText('93.00%')).toBeInTheDocument();
  });

  it('shows an error toast when submitting without image, location, or AI result', async () => {
    setWindowWidth(1280);

    renderWithProviders(<AddObservation />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /submit observation/i }));
    expect(toast.error).toHaveBeenCalledWith('Please fill all mandatory fields');
    expect(observationsService.createObservation).not.toHaveBeenCalled();
  });

  it('calls createObservation with the correct payload on a valid submission', async () => {
    setWindowWidth(1280);

    (observationsService.predictSpecies as any).mockResolvedValue({
      species: 'Papilio machaon',
      confidence: 0.87,
    });
    (observationsService.createObservation as any).mockResolvedValue({ id: 99 });

    renderWithProviders(<AddObservation />);
    const user = userEvent.setup();

    const file = new File(['img'], 'butterfly.jpg', { type: 'image/jpeg' });
    await user.upload(document.querySelector('input[type="file"]') as HTMLElement, file);
    await screen.findByText('Papilio machaon');
    await user.click(screen.getByText('Set Location'));
    await user.click(screen.getByRole('button', { name: /submit observation/i }));

    expect(observationsService.createObservation).toHaveBeenCalledOnce();

    const payload = (observationsService.createObservation as any).mock.calls[0][0];
    expect(payload.species).toBe('Papilio machaon');
    expect(payload.confidence_level).toBe(0.87);
    expect(payload.latitude).toBe(31.8);
    expect(payload.longitude).toBe(35.9);
    expect(payload.images).toHaveLength(1);
  });
});
