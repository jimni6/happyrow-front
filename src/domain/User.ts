/**
 * User metadata type - supports common metadata value types
 */
type UserMetadataValue = string | number | boolean | null | undefined;

/**
 * User domain entity
 * Represents a user in the system with essential properties
 */
export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  firstname: string;
  lastname: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, UserMetadataValue>;
}

/**
 * User credentials for authentication
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * User registration data
 */
export interface UserRegistration extends UserCredentials {
  firstname: string;
  lastname: string;
  confirmPassword?: string;
  metadata?: Record<string, UserMetadataValue>;
}

/**
 * Authentication session information
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
