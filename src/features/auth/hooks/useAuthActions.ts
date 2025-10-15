import { useState } from 'react';
import type {
  AuthRepository,
  UserCredentials,
  UserRegistration,
} from '../types';
import {
  RegisterUser,
  SignInUser,
  SignOutUser,
  ResetPassword,
} from '../use-cases';

interface UseAuthActionsProps {
  authRepository: AuthRepository;
}

interface AuthActionState {
  loading: boolean;
  error: string | null;
}

export const useAuthActions = ({ authRepository }: UseAuthActionsProps) => {
  const [registerState, setRegisterState] = useState<AuthActionState>({
    loading: false,
    error: null,
  });

  const [signInState, setSignInState] = useState<AuthActionState>({
    loading: false,
    error: null,
  });

  const [signOutState, setSignOutState] = useState<AuthActionState>({
    loading: false,
    error: null,
  });

  const [resetPasswordState, setResetPasswordState] = useState<AuthActionState>(
    {
      loading: false,
      error: null,
    }
  );

  const register = async (userData: UserRegistration) => {
    setRegisterState({ loading: true, error: null });
    try {
      const registerUser = new RegisterUser(authRepository);
      const user = await registerUser.execute(userData);
      setRegisterState({ loading: false, error: null });
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setRegisterState({ loading: false, error: errorMessage });
      throw error;
    }
  };

  const signIn = async (credentials: UserCredentials) => {
    setSignInState({ loading: true, error: null });
    try {
      const signInUser = new SignInUser(authRepository);
      const session = await signInUser.execute(credentials);
      setSignInState({ loading: false, error: null });
      return session;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed';
      setSignInState({ loading: false, error: errorMessage });
      throw error;
    }
  };

  const signOut = async () => {
    setSignOutState({ loading: true, error: null });
    try {
      const signOutUser = new SignOutUser(authRepository);
      await signOutUser.execute();
      setSignOutState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign out failed';
      setSignOutState({ loading: false, error: errorMessage });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setResetPasswordState({ loading: true, error: null });
    try {
      const resetPasswordUseCase = new ResetPassword(authRepository);
      await resetPasswordUseCase.execute(email);
      setResetPasswordState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed';
      setResetPasswordState({ loading: false, error: errorMessage });
      throw error;
    }
  };

  return {
    register: {
      execute: register,
      loading: registerState.loading,
      error: registerState.error,
    },
    signIn: {
      execute: signIn,
      loading: signInState.loading,
      error: signInState.error,
    },
    signOut: {
      execute: signOut,
      loading: signOutState.loading,
      error: signOutState.error,
    },
    resetPassword: {
      execute: resetPassword,
      loading: resetPasswordState.loading,
      error: resetPasswordState.error,
    },
  };
};
