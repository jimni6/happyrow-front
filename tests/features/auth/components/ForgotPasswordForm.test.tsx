import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ForgotPasswordForm } from '@/features/auth/components';

describe('ForgotPasswordForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBackToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form correctly', () => {
    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /back to sign in/i })
    ).toBeInTheDocument();
  });

  it('should handle email input changes', async () => {
    const user = userEvent.setup();

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should call onSubmit with email when form is submitted', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
  });

  it('should show success message after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /check your email/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/we've sent a password reset link to/i)
    ).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(
      screen.getByText(/please check your email and follow the instructions/i)
    ).toBeInTheDocument();
  });

  it('should handle form submission errors gracefully', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Reset failed'));

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Should not show success message on error
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /check your email/i })
      ).not.toBeInTheDocument();
    });

    // Form should still be visible
    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it('should call onBackToLogin when back button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const backButton = screen.getByRole('button', { name: /back to sign in/i });
    await user.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('should call onBackToLogin from success screen', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Submit form to get to success screen
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /check your email/i })
      ).toBeInTheDocument();
    });

    // Click back button on success screen
    const backButton = screen.getByRole('button', { name: /back to sign in/i });
    await user.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
        error="Reset password failed"
      />
    );

    expect(screen.getByText('Reset password failed')).toBeInTheDocument();
  });

  it('should show loading state when loading prop is true', () => {
    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
        loading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /sending.../i });
    const emailInput = screen.getByLabelText(/email/i);
    const backButton = screen.getByRole('button', { name: /back to sign in/i });

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(backButton).toBeDisabled();
  });

  it('should require email input', async () => {
    const user = userEvent.setup();

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });
    await user.click(submitButton);

    // Form should not submit without email
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate email format', () => {
    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('should not render back button when onBackToLogin is not provided', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    expect(
      screen.queryByRole('button', { name: /back to sign in/i })
    ).not.toBeInTheDocument();
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
  });

  it('should prevent form submission when loading', async () => {
    const user = userEvent.setup();

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
        loading={true}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);

    // Try to type in disabled input
    await user.type(emailInput, 'test@example.com');

    // Input should remain empty because it's disabled
    expect(emailInput).toHaveValue('');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should maintain email value in success screen', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ForgotPasswordForm
        onSubmit={mockOnSubmit}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'user@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });
});
