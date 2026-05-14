import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import userEvent from '@testing-library/user-event';
import * as authService from '../../services/authService';

vi.mock('../../services/authService', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  saveSpecializations: vi.fn(),
}));

vi.mock('../../lib/axiosConfig', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

// react-select replaced with a regular select
vi.mock('react-select', () => ({
  default: ({ options, onChange, placeholder }: any) => (
    <select
      data-testid="specialization-name-select"
      aria-label={placeholder ?? 'name-select'}
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


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );


const fillBaseFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('Username'), 'heba_test');
  await user.type(screen.getByPlaceholderText('Email Address'), 'heba@test.com');
  await user.type(screen.getByPlaceholderText('First Name'), 'Heba');
  await user.type(screen.getByPlaceholderText('Last Name'), 'Test');
  await user.type(screen.getByPlaceholderText('Phone Number'), '+962791234567');
  await user.type(screen.getByPlaceholderText('Password'), 'ValidPass1');
  await user.type(screen.getByPlaceholderText('Confirm Password'), 'ValidPass1');
};


describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('shows validation errors for a short password and missing username', async () => {
    renderWithProviders(<Register />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Password'), 'Abc');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Username must be at least 3 characters')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it("shows 'Passwords don't match' when confirm password differs", async () => {
    renderWithProviders(<Register />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Username'), 'heba_test');
    await user.type(screen.getByPlaceholderText('Email Address'), 'heba@test.com');
    await user.type(screen.getByPlaceholderText('First Name'), 'Heba');
    await user.type(screen.getByPlaceholderText('Last Name'), 'Test');
    await user.type(screen.getByPlaceholderText('Phone Number'), '+962791234567');
    await user.type(screen.getByPlaceholderText('Password'), 'ValidPass1');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'OtherPass2');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
  });

  it('reveals researcher-only fields when Researcher role is selected and not otherwise', async () => {
    renderWithProviders(<Register />);
    const user = userEvent.setup();

    expect(screen.queryByPlaceholderText('Institute Name (e.g. JUST)')).not.toBeInTheDocument();

    const researcherBtn = screen.getByText('Researcher').closest('button')!;
    await user.click(researcherBtn);

    expect(screen.getByPlaceholderText('Institute Name (e.g. JUST)')).toBeInTheDocument();
    expect(screen.getByText('Upload Credentials')).toBeInTheDocument();
  });

  it('shows credentials validation error when researcher submits without a file', async () => {
    renderWithProviders(<Register />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Researcher').closest('button')!);
    await fillBaseFields(user);

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('File is required')).toBeInTheDocument();
  });

  it('lets a researcher pick a specialization and see it appear as a chip', async () => {
    renderWithProviders(<Register />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Researcher').closest('button')!);

    await user.selectOptions(screen.getByDisplayValue('Family'), 'Class');
    await user.selectOptions(screen.getByTestId('specialization-name-select'), 'Insecta');
    await user.click(screen.getByRole('button', { name: /add specialization/i }));
    expect(screen.getByText('Insecta')).toBeInTheDocument();
  });

  it('calls registerUser then loginUser on a valid researcher submission', async () => {
    (authService.registerUser as any).mockResolvedValue({});
    (authService.loginUser as any).mockResolvedValue({});
    (authService.saveSpecializations as any).mockResolvedValue({});

    renderWithProviders(<Register />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Researcher').closest('button')!);
    await fillBaseFields(user);
    await user.type(screen.getByPlaceholderText('Institute Name (e.g. JUST)'), 'JUST');

    const file = new File(['dummy content'], 'credentials.jpg', { type: 'image/jpeg' });
    await user.upload(document.querySelector('input[type="file"]') as HTMLElement, file);

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(authService.registerUser).toHaveBeenCalledOnce();
    expect(authService.loginUser).toHaveBeenCalledWith({
      username: 'heba@test.com',
      password: 'ValidPass1',
    });
  });
});
