// hooks/use-auth.ts
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export const useAuth = () => {
  const { userId, getToken, isLoaded, isSignedIn } = useClerkAuth();

  const validateUser = useCallback(async () => {
    if (!isLoaded) {
      throw new Error("Auth is not loaded yet");
    }
    
    if (!isSignedIn) {
      throw new Error("User is not signed in");
    }
    
    return userId;
  }, [isLoaded, isSignedIn, userId]);

  const getAuthToken = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No auth token available");
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  }, [getToken]);

  const getUserSession = useCallback(async () => {
    try {
      await validateUser();
      const token = await getAuthToken();
      
      return {
        userId,
        token,
      };
    } catch (error) {
      console.error("Error getting user session:", error);
      throw error;
    }
  }, [validateUser, getAuthToken, userId]);

  return {
    userId,
    isLoaded,
    isSignedIn,
    validateUser,
    getAuthToken,
    getUserSession,
  };
};

// types/auth.ts
export interface UserSession {
  userId: string;
  token: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}