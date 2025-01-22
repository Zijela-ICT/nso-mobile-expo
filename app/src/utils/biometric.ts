import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class BiometricService {
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  static async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  static async storeCredentials(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync('biometricLogin', credentials, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  static async getStoredCredentials(): Promise<
    { username: string; password: string } | false
  > {
    try {
      const credentials = await SecureStore.getItemAsync('biometricLogin');
      if (credentials) {
        const { email, password } = JSON.parse(credentials);
        return {
          username: email,
          password: password,
        };
      }
      return false;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return false;
    }
  }

  static async removeStoredCredentials(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync('biometricLogin');
      return true;
    } catch (error) {
      console.error('Error removing stored credentials:', error);
      return false;
    }
  }

  static async authenticateWithBiometrics(
    promptMessage: string = 'Confirm fingerprint',
  ): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }
}