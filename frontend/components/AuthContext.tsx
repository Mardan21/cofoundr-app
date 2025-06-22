import { AuthTokens, User } from "@/types/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Platform } from "react-native";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper functions for secure storage that work on all platforms
const secureStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      // Use AsyncStorage for web
      await AsyncStorage.setItem(key, value);
    } else {
      // Use SecureStore for iOS/Android
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string) {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string) {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem("user");
      const tokens = await secureStorage.getItem("authTokens");

      if (storedUser && tokens) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (tokens: AuthTokens, userData: User) => {
    try {
      await secureStorage.setItem("authTokens", JSON.stringify(tokens));
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await secureStorage.deleteItem("authTokens");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
