/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication state and functions
 */

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';
import type { AuthUser } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const user = session?.user as AuthUser | undefined;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);
  
  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    session,
  };
}
