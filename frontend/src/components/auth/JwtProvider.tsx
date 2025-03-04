'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define the authentication state type
type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: JwtUser | null;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string | null>;
};

// Define the user type from JWT claims
export type JwtUser = {
  userId: string;
  email: string;
  name: string;
};

// Create the context with default values
const JwtContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  token: null,
  login: async () => {},
  logout: () => {},
  getToken: async () => null,
});

// Custom hook to use the JWT context
export const useJwtAuth = () => useContext(JwtContext);

// Provider component
export const JwtProviderWithNavigate = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<JwtUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Parse JWT token to get user information
  const parseJwt = (token: string): JwtUser | null => {
    try {
      console.log('JwtProvider - Parsing JWT token');
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        console.error('JwtProvider - Invalid token format (missing payload)');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const parsed = JSON.parse(jsonPayload);
      console.log('JwtProvider - Parsed token payload:', {
        userId: parsed.userId,
        email: parsed.email,
        name: parsed.name,
        exp: parsed.exp ? new Date(parsed.exp * 1000).toISOString() : 'none'
      });
      
      // Validate required fields
      if (!parsed.userId || !parsed.email) {
        console.error('JwtProvider - Token missing required fields');
        return null;
      }
      
      return {
        userId: parsed.userId,
        email: parsed.email,
        name: parsed.name || ''
      };
    } catch (error) {
      console.error('JwtProvider - Error parsing JWT:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      console.log('JwtProvider - Initializing auth state');
      const storedToken = localStorage.getItem('jwt_token');
      
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          console.log('JwtProvider - Stored token is expired, logging out');
          localStorage.removeItem('jwt_token');
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        } else {
          console.log('JwtProvider - Found valid stored token');
          const userData = parseJwt(storedToken);
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log(`Attempting to login at ${apiUrl}/api/auth/login`);
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Get the response as text first
      const responseText = await response.text();
      console.log(`Login response status: ${response.status}`);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server error: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Login failed';
        console.error('Login error response:', data);
        throw new Error(errorMessage);
      }

      const { token: newToken } = data;
      
      if (!newToken) {
        console.error('No token in response:', data);
        throw new Error('No authentication token received');
      }
      
      // Store token in localStorage
      localStorage.setItem('jwt_token', newToken);
      
      // Parse user data from token
      const userData = parseJwt(newToken);
      
      if (!userData) {
        console.error('Failed to parse user data from token');
        throw new Error('Invalid authentication token');
      }
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Redirect to profile page
      router.push('/profile');
    } catch (err) {
      console.error('JwtProvider - Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('JwtProvider - Logging out');
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    router.push('/');
  };

  // Get token function (for API calls)
  const getToken = async (): Promise<string | null> => {
    const currentToken = token || localStorage.getItem('jwt_token');
    
    if (!currentToken) {
      return null;
    }
    
    if (isTokenExpired(currentToken)) {
      console.log('JwtProvider - Token expired during getToken call');
      localStorage.removeItem('jwt_token');
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      return null;
    }
    
    return currentToken;
  };

  // Context value
  const contextValue: AuthState = {
    isAuthenticated,
    isLoading,
    user,
    error,
    token,
    login,
    logout,
    getToken,
  };

  return (
    <JwtContext.Provider value={contextValue}>
      {children}
    </JwtContext.Provider>
  );
}; 