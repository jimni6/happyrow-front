import { SupabaseAuthRepository } from './SupabaseAuthRepository';
import { supabaseConfig } from '@/core/config/supabase';
import type { AuthRepository } from '../types/AuthRepository';

/**
 * Authentication Service Factory
 * Creates and configures authentication repository instances
 * following dependency injection principles
 */
export class AuthServiceFactory {
  private static instance: AuthRepository | null = null;

  /**
   * Get the authentication repository instance
   * Uses singleton pattern to ensure single instance across the app
   */
  static getAuthRepository(): AuthRepository {
    if (!this.instance) {
      this.instance = new SupabaseAuthRepository(
        supabaseConfig.url,
        supabaseConfig.anonKey
      );
    }
    return this.instance;
  }

  /**
   * Create a new authentication repository instance
   * Useful for testing or when you need a fresh instance
   */
  static createAuthRepository(): AuthRepository {
    return new SupabaseAuthRepository(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );
  }

  /**
   * Reset the singleton instance
   * Useful for testing or configuration changes
   */
  static resetInstance(): void {
    this.instance = null;
  }
}
