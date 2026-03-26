import {
  createClient,
  type SupabaseClient,
  type User as SupabaseUser,
  type Session as SupabaseSession,
} from '@supabase/supabase-js';
import type {
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
} from '../types/User';
import type { AuthRepository } from '../types/AuthRepository';

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
    const { data, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          firstname: userData.firstname,
          lastname: userData.lastname,
          ...userData.metadata,
        },
      },
    });

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Registration failed: No user data returned');
    }

    return this.mapSupabaseUserToUser(data.user);
  }

  async signIn(credentials: UserCredentials): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      throw new Error('Sign in failed: No session data returned');
    }

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

  async signInWithProvider(provider: 'google'): Promise<void> {
    const redirectTo = window.location.origin;
    // #region agent log
    fetch('http://127.0.0.1:7650/ingest/addb5d08-2bef-4f9b-b9ff-5c0712d6202d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '9c0c76',
      },
      body: JSON.stringify({
        sessionId: '9c0c76',
        location: 'SupabaseAuthRepository.ts:signInWithProvider',
        message: 'OAuth redirect config',
        data: {
          redirectTo,
          windowOrigin: window.location.origin,
          windowHref: window.location.href,
          provider,
        },
        timestamp: Date.now(),
        hypothesisId: 'H5+H6',
      }),
    }).catch(() => {});
    // #endregion

    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new Error(`OAuth sign in failed: ${error.message}`);
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
