import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const StorageKeys = {
  USER: 'user',
  AUTH_TOKENS: 'authTokens',
  ONBOARDING_COMPLETE: 'onboardingComplete',
};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  },

  async getItem(key: string): Promise<any> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};