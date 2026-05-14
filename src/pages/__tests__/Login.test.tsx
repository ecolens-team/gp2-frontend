import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Login from '../login';
import userEvent from '@testing-library/user-event';
import AuthProvider from '../../contexts/AuthContext/AuthProvider';

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
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
};

const mockLogin = vi.fn();

vi.mock('../../contexts/AuthContext/AuthContext', async (importOriginal) => {
  const real =
    await importOriginal<
      typeof import('../../contexts/AuthContext/AuthContext')
    >();
  return {
    ...real,
    useAuth: () => ({ login: mockLogin, authUser: null, logout: vi.fn() }),
  };
});

describe('Login page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('renders validation error when submitting empty form', async () => {
    renderWithProviders(<Login />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('Email or Username is required'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('calls login with entered crentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithProviders(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Enter email or username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '14514fas');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: '14514fas',
    });
  });
});
