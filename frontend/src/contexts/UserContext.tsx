'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useJwtAuth } from '@/components/auth/JwtProvider';

// Define the User type
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// Define the context type
type UserContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  createOrGetUser: () => Promise<User | null>;
  clearUser: () => void;
};

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null,
  createOrGetUser: async () => null,
  clearUser: () => {},
});

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: jwtUser, isAuthenticated, isLoading: jwtLoading, getToken } = useJwtAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedUserCreation, setHasAttemptedUserCreation] = useState(false);

  // Debug logging for JWT state
  useEffect(() => {
    console.log('UserContext - JWT state:', { 
      isAuthenticated, 
      jwtLoading, 
      jwtUser: jwtUser ? {
        userId: jwtUser.userId,
        email: jwtUser.email,
        name: jwtUser.name
      } : null 
    });
  }, [isAuthenticated, jwtLoading, jwtUser]);

  // Function to create or get a user
  const createOrGetUser = async (): Promise<User | null> => {
    console.log('UserContext - createOrGetUser called');
    console.log('UserContext - JWT state in createOrGetUser:', { 
      isAuthenticated, 
      jwtLoading, 
      jwtUser: jwtUser ? {
        userId: jwtUser.userId,
        email: jwtUser.email,
        name: jwtUser.name
      } : null 
    });

    if (!isAuthenticated) {
      console.log('UserContext - Not authenticated');
      setError('User is not authenticated');
      return null;
    }

    if (!jwtUser) {
      console.log('UserContext - No JWT user available');
      setError('No user information available');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user by ID
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log(`UserContext - Getting user with ID: ${jwtUser.userId}`);
      
      try {
        // Get an access token
        const token = await getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }
        
        console.log('UserContext - Got access token');
        
        // Try to get the user by ID
        const response = await fetch(`${apiUrl}/api/users/${jwtUser.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // User exists, return it
          const userData = await response.json();
          console.log('UserContext - Found existing user:', userData);
          setUser(userData);
          setHasAttemptedUserCreation(true);
          return userData;
        } else if (response.status === 404) {
          // User doesn't exist, create a new one
          console.log('UserContext - User not found, creating new user');
          
          const createResponse = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              email: jwtUser.email,
              name: jwtUser.name
            })
          });
          
          if (createResponse.ok) {
            const newUser = await createResponse.json();
            console.log('UserContext - Created new user:', newUser);
            setUser(newUser);
            setHasAttemptedUserCreation(true);
            return newUser;
          } else {
            throw new Error(`Failed to create user: ${createResponse.statusText}`);
          }
        } else {
          throw new Error(`Failed to get user: ${response.statusText}`);
        }
      } catch (err) {
        console.error('UserContext - API call failed:', err);
        
        // If API call fails, fall back to mock user for development
        console.log('UserContext - Creating mock user from JWT user:', jwtUser);
        
        const mockUser: User = {
          id: jwtUser.userId || 'mock-id',
          email: jwtUser.email || 'mock@example.com',
          name: jwtUser.name || 'Mock User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('UserContext - Mock user created:', mockUser);
        setUser(mockUser);
        setHasAttemptedUserCreation(true);
        return mockUser;
      }
    } catch (err) {
      console.error('UserContext - Error creating or getting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create or get user');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the user
  const clearUser = () => {
    console.log('UserContext - clearUser called');
    setUser(null);
    setHasAttemptedUserCreation(false);
    setError(null);
  };

  // Effect to create or get user when authenticated
  useEffect(() => {
    console.log('UserContext - Authentication state changed effect');
    
    if (jwtLoading) {
      console.log('UserContext - JWT is still loading');
      return;
    }

    if (!isAuthenticated) {
      console.log('UserContext - User is not authenticated, clearing user');
      clearUser();
      return;
    }

    if (!user && !isLoading && !hasAttemptedUserCreation && jwtUser) {
      console.log('UserContext - User is authenticated but no app user, creating one');
      createOrGetUser().catch(err => {
        console.error('UserContext - Error in automatic user creation:', err);
      });
    }
  }, [isAuthenticated, jwtLoading, user, isLoading, hasAttemptedUserCreation, jwtUser]);

  // The context value
  const contextValue: UserContextType = {
    user,
    isLoading,
    error,
    createOrGetUser,
    clearUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}; 