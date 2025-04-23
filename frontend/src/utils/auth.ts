// src/utils/auth.ts

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  
  /**
   * Set the authentication token in localStorage
   */
  export const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  };
  
  /**
   * Remove the authentication token from localStorage
   */
  export const removeAuthToken = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };