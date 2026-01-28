// Types
export type {
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
} from './types/User';
export type { AuthRepository } from './types/AuthRepository';

// Services
export { SupabaseAuthRepository } from './services/SupabaseAuthRepository';
export { AuthServiceFactory } from './services/AuthServiceFactory';

// Hooks
export { AuthProvider } from './hooks/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useAuthActions } from './hooks/useAuthActions';

// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { LoginModal } from './components/LoginModal';
export { RegisterModal } from './components/RegisterModal';

// Views
export { AuthView } from './views/AuthView';

// Use Cases
export { RegisterUser } from './use-cases/RegisterUser';
export { SignInUser } from './use-cases/SignInUser';
export { SignOutUser } from './use-cases/SignOutUser';
export { GetCurrentUser } from './use-cases/GetCurrentUser';
export { ResetPassword } from './use-cases/ResetPassword';
