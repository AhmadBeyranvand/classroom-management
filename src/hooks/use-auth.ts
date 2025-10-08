'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  studentProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
  };
  parentProfile?: {
    id: string;
    phone?: string;
    student?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });

  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || 
                   document.cookie
                     .split('; ')
                     .find(row => row.startsWith('token='))
                     ?.split('=')[1];

      if (!token) {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        });
        return;
      }

      const response = await fetch('/api/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          authenticated: data.authenticated,
        });
      } else {
        // Token is invalid, clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, role: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set cookies
        document.cookie = `token=${data.token}; path=/; max-age=86400; secure=${process.env.NODE_ENV === 'production'}; samesite=strict`;
        document.cookie = `userRole=${data.user.role}; path=/; max-age=86400; secure=${process.env.NODE_ENV === 'production'}; samesite=strict`;
        
        // Store in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth state
        setAuthState({
          user: data.user,
          loading: false,
          authenticated: true,
        });

        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'خطا در ارتباط با سرور' };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
  }) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'خطا در ارتباط با سرور' };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and cookies
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'userRole=; path=/; max-age=0';
      
      // Update auth state
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });

      // Redirect to login
      router.push('/');
    }
  }, [router]);

  // Update profile function
  const updateProfile = useCallback(async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    birthDate?: string;
  }) => {
    try {
      const token = localStorage.getItem('token') || 
                   document.cookie
                     .split('; ')
                     .find(row => row.startsWith('token='))
                     ?.split('=')[1];

      if (!token) {
        return { success: false, error: 'احراز هویت لازم است' };
      }

      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth state
        setAuthState(prev => ({
          ...prev,
          user: data.user,
        }));

        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'خطا در ارتباط با سرور' };
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user: authState.user,
    loading: authState.loading,
    authenticated: authState.authenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };
}