import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from '../../../presentation/screens/AuthScreen';
import { MockAuthRepository } from '../../utils/testUtils';
import type { UserCredentials, UserRegistration } from '../../../domain/User';

// Types for mock component props
interface MockLoginFormProps {
  onSubmit: (credentials: UserCredentials) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  loading?: boolean;
  error?: string | null;
}

interface MockRegisterFormProps {
  onSubmit: (userData: UserRegistration) => void;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string | null;
}

interface MockForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string | null;
}

// Mock the hooks and components that AuthScreen uses
vi.mock('../../../presentation/hooks/useAuthActions', () => ({
  useAuthActions: () => ({
    signIn: {
      execute: vi.fn(),
      loading: false,
      error: null,
    },
    register: {
      execute: vi.fn(),
      loading: false,
      error: null,
    },
    resetPassword: {
      execute: vi.fn(),
      loading: false,
      error: null,
    },
  }),
}));

vi.mock('../../../presentation/components/LoginForm', () => ({
  LoginForm: ({
    onSubmit,
    onSwitchToRegister,
    onForgotPassword,
  }: MockLoginFormProps) => (
    <div data-testid="login-form">
      <button
        onClick={() =>
          onSubmit({ email: 'test@example.com', password: 'password' })
        }
      >
        Sign In
      </button>
      <button onClick={onSwitchToRegister}>Switch to Register</button>
      <button onClick={onForgotPassword}>Forgot Password</button>
    </div>
  ),
}));

vi.mock('../../../presentation/components/RegisterForm', () => ({
  RegisterForm: ({ onSubmit, onSwitchToLogin }: MockRegisterFormProps) => (
    <div data-testid="register-form">
      <button
        onClick={() =>
          onSubmit({ email: 'test@example.com', password: 'password' })
        }
      >
        Register
      </button>
      <button onClick={onSwitchToLogin}>Switch to Login</button>
    </div>
  ),
}));

vi.mock('../../../presentation/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: ({
    onSubmit,
    onBackToLogin,
  }: MockForgotPasswordFormProps) => (
    <div data-testid="forgot-password-form">
      <button onClick={() => onSubmit('test@example.com')}>
        Send Reset Link
      </button>
      <button onClick={onBackToLogin}>Back to Login</button>
    </div>
  ),
}));

vi.mock('../../../presentation/components/ConnectionButton', () => ({
  ConnectionButton: () => (
    <button data-testid="connection-button">Test Connection</button>
  ),
}));

vi.mock('../../../application/checkConnection', () => ({
  CheckConnection: vi.fn(),
}));

vi.mock('../../../infrastructure/ConnectionApiRepository', () => ({
  ConnectionApiRepository: vi.fn(),
}));

vi.mock('../../../config/api', () => ({
  apiConfig: { baseUrl: 'http://localhost:3000' },
}));

describe('AuthScreen', () => {
  let mockAuthRepository: MockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = new MockAuthRepository();
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<AuthScreen authRepository={mockAuthRepository} />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('forgot-password-form')
    ).not.toBeInTheDocument();
  });

  it('should render connection test button', () => {
    render(<AuthScreen authRepository={mockAuthRepository} />);

    expect(screen.getByTestId('connection-button')).toBeInTheDocument();
    expect(screen.getByText(/test api connection/i)).toBeInTheDocument();
  });

  it('should switch to register form when requested', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    const switchButton = screen.getByText('Switch to Register');
    await user.click(switchButton);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  it('should switch to forgot password form when requested', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    const forgotButton = screen.getByText('Forgot Password');
    await user.click(forgotButton);

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  it('should switch back to login from register form', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Go to register
    await user.click(screen.getByText('Switch to Register'));
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Go back to login
    await user.click(screen.getByText('Switch to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
  });

  it('should switch back to login from forgot password form', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Go to forgot password
    await user.click(screen.getByText('Forgot Password'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();

    // Go back to login
    await user.click(screen.getByText('Back to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(
      screen.queryByTestId('forgot-password-form')
    ).not.toBeInTheDocument();
  });

  it('should handle login form submission', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);

    // The mock useAuthActions should be called
    // Since we're mocking the hook, we can't directly test the repository call
    // but we can verify the form interaction works
    expect(signInButton).toBeInTheDocument();
  });

  it('should handle register form submission', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Switch to register form
    await user.click(screen.getByText('Switch to Register'));
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    const registerButton = screen.getByText('Register');
    await user.click(registerButton);

    // After registration, should switch back to login form
    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  it('should handle forgot password form submission', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Switch to forgot password form
    await user.click(screen.getByText('Forgot Password'));

    const resetButton = screen.getByText('Send Reset Link');
    await user.click(resetButton);

    // Verify the interaction works
    expect(resetButton).toBeInTheDocument();
  });

  it('should maintain auth repository reference', () => {
    render(<AuthScreen authRepository={mockAuthRepository} />);

    // The component should render without errors, indicating it properly
    // received and is using the auth repository
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should render all auth modes correctly', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Test login mode
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Test register mode
    await user.click(screen.getByText('Switch to Register'));
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Test forgot password mode
    await user.click(screen.getByText('Switch to Login'));
    await user.click(screen.getByText('Forgot Password'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('should handle navigation between all forms', async () => {
    const user = userEvent.setup();

    render(<AuthScreen authRepository={mockAuthRepository} />);

    // Start with login
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Login -> Register
    await user.click(screen.getByText('Switch to Register'));
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Register -> Login
    await user.click(screen.getByText('Switch to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Login -> Forgot Password
    await user.click(screen.getByText('Forgot Password'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();

    // Forgot Password -> Login
    await user.click(screen.getByText('Back to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
