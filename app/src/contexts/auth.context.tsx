import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricService } from '@/utils/biometric';
import { showToast } from '@/utils/toast';

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
  isBiometricEnabled: boolean;
  enableBiometric: (email?: string, password?: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, biometricEnabled] = await Promise.all([
          AsyncStorage.getItem('@auth_token'),
          AsyncStorage.getItem('@biometric_enabled'),
        ]);

        setIsAuthenticated(!!token);
        setIsBiometricEnabled(biometricEnabled === 'true');
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('@auth_token'),
        BiometricService.removeStoredCredentials(),
      ]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const enableBiometric = async (email?: string, password?: string): Promise<boolean> => {
    try {
      const isAvailable = await BiometricService.isBiometricAvailable();
      if (!isAvailable) {
        showToast('Biometric authentication is not available on this device', 'error');
        return false;
      }

      const keysCreated = await BiometricService.createKeys();
      if (!keysCreated) {
        showToast('Failed to set up biometric authentication', 'error');
        return false;
      }

      // Only store credentials if email and password are provided
      if (email && password) {
        const credentialsStored = await BiometricService.storeCredentials(email, password);
        if (!credentialsStored) {
          showToast('Failed to store credentials securely', 'error');
          return false;
        }
      }

      await AsyncStorage.setItem('@biometric_enabled', 'true');
      setIsBiometricEnabled(true);
      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      showToast('Failed to enable biometric authentication', 'error');
      return false;
    }
  };


  const disableBiometric = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('@biometric_enabled'),
        BiometricService.removeStoredCredentials(),
      ]);
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      showToast('Failed to disable biometric authentication', 'error');
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      if (!isBiometricEnabled) {
        return false;
      }

      const authenticated = await BiometricService.authenticateWithBiometrics(
        'Please authenticate to continue'
      );

      return authenticated;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        isBiometricEnabled,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
