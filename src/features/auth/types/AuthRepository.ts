import type {
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
} from './User';

/**
 * Authentication repository interface
 * Defines the contract for authentication operations following clean architecture principles
 */
export interface AuthRepository {
  /**
   * Register a new user
   */
  register(userData: UserRegistration): Promise<User>;

  /**
   * Sign in with email and password
   */
  signIn(credentials: UserCredentials): Promise<AuthSession>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Get the current session
   */
  getCurrentSession(): Promise<AuthSession | null>;

  /**
   * Refresh the current session
   */
  refreshSession(): Promise<AuthSession>;

  /**
   * Reset password via email
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Update user password
   */
  updatePassword(newPassword: string): Promise<void>;

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void;
}
