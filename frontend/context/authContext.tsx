import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
const USER_ID_KEY = '@auth_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Load stored user ID when the app starts
    const loadStoredUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (storedUserId) {
          setUserId(storedUserId);
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error loading stored user ID:', error);
      } finally {
        setInitialized(true);
      }
    };

    loadStoredUserId();
  }, []);

  const login = async (userId: string) => {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userId.toString());
      setUserId(userId);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error storing user ID:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);
      setUserId(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error removing stored user ID:', error);
    }
  };

  if (!initialized) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <AuthContext.Provider value={{ userId, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};