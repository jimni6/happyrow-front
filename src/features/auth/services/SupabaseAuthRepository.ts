import {
  createClient,
  type SupabaseClient,
  type User as SupabaseUser,
  type Session as SupabaseSession,
} from '@supabase/supabase-js';
import type {
  AuthRepository,
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
} from '../types';

/**
 * Supabase implementation of AuthRepository
 * Handles authentication operations using Supabase
 */
export class SupabaseAuthRepository implements AuthRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async register(userData: UserRegistration): Promise<User> {
    console.log('Attempting to register user:', { email: userData.email });

    const { data, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstname: userData.firstname,
          lastname: userData.lastname,
          ...userData.metadata,
        },
      },
    });

    if (error) {
      console.error('Supabase registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      console.error('No user data returned from Supabase');
      throw new Error('Registration failed: No user data returned');
    }

    console.log('Registration successful:', data.user.email);
    return this.mapSupabaseUserToUser(data.user);
  }

  async signIn(credentials: UserCredentials): Promise<AuthSession> {
    console.log('Attempting to sign in user:', { email: credentials.email });

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Supabase sign-in error:', error);
      throw new Error(`Sign in failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      console.error('No session data returned from Supabase');
      throw new Error('Sign in failed: No session data returned');
    }

    console.log('Sign in successful:', data.user.email);
    return this.mapSupabaseSessionToAuthSession(data.session, data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) {
      // Handle session_not_found errors gracefully
      if (error.message.includes('session_not_found') || error.status === 403) {
        console.log('Session not found, user needs to re-authenticate');
        return null;
      }
      throw new Error(error.message);
    }

    return user ? this.mapSupabaseUserToUser(user) : null;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (error) {
      // Handle session_not_found errors gracefully
      if (error.message.includes('session_not_found') || error.status === 403) {
        console.log('Session not found, returning null');
        return null;
      }
      throw new Error(error.message);
    }

    return session
      ? this.mapSupabaseSessionToAuthSession(session, session.user)
      : null;
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession();

    if (error) {
      // Handle refresh token errors gracefully
      if (
        error.message.includes('refresh_token_not_found') ||
        error.message.includes('session_not_found') ||
        error.status === 403
      ) {
        throw new Error('session_expired');
      }
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error('Session refresh failed: No session data returned');
    }

    console.log('Session refreshed successfully');
    return this.mapSupabaseSessionToAuthSession(data.session, data.user);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        callback(this.mapSupabaseSessionToAuthSession(session, session.user));
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Maps Supabase user to domain User entity
   */
  private mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
    const userMetadata = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      emailConfirmed: supabaseUser.email_confirmed_at !== null,
      firstname: userMetadata.firstname || '',
      lastname: userMetadata.lastname || '',
      createdAt: new Date(supabaseUser.created_at || new Date()),
      updatedAt: new Date(supabaseUser.updated_at || new Date()),
      metadata: userMetadata,
    };
  }

  /**
   * Maps Supabase session to domain AuthSession entity
   */
  private mapSupabaseSessionToAuthSession(
    supabaseSession: SupabaseSession,
    supabaseUser: SupabaseUser
  ): AuthSession {
    return {
      user: this.mapSupabaseUserToUser(supabaseUser),
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(
        (supabaseSession.expires_at || Math.floor(Date.now() / 1000) + 3600) *
          1000
      ),
    };
  }
}
