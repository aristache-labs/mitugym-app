import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for AsyncStorage (can have @ symbol)
const ASYNC_STORAGE_KEYS = {
  REMEMBER_ME: '@mitugym_remember_me',
  SESSION_TOKEN: '@mitugym_session_token',
  USER_EMAIL: '@mitugym_user_email',
} as const;

// Interface for stored auth data
interface StoredAuthData {
  email: string;
  sessionToken: string;
  timestamp: number;
  expiresAt: number;
}

export class SecureStorage {
  // Remember Me duration: 30 days
  private static readonly REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  /**
   * Store authentication data when "Remember Me" is enabled
   */
  static async storeRememberMeData(email: string, sessionToken: string): Promise<void> {
    try {
      // Validate input parameters
      if (!email || !sessionToken) {
        throw new Error('Invalid email or session token provided');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      const now = Date.now();
      const authData: StoredAuthData = {
        email: email.toLowerCase().trim(), // Normalize email
        sessionToken,
        timestamp: now,
        expiresAt: now + this.REMEMBER_ME_DURATION,
      };

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REMEMBER_ME, JSON.stringify(authData));
      console.log('SecureStorage: Remember me data stored successfully');
    } catch (error) {
      console.error('SecureStorage: Failed to store remember me data:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored authentication data if valid
   */
  static async getRememberMeData(): Promise<StoredAuthData | null> {
    try {
      const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.REMEMBER_ME);

      if (!storedData) {
        console.log('SecureStorage: No remember me data found');
        return null;
      }

      const authData: StoredAuthData = JSON.parse(storedData);
      const now = Date.now();

      // Validate data structure
      if (!authData.email || !authData.sessionToken || !authData.timestamp || !authData.expiresAt) {
        console.log('SecureStorage: Invalid data structure, clearing...');
        await this.clearRememberMeData();
        return null;
      }

      // Check if the stored data has expired
      if (now > authData.expiresAt) {
        console.log('SecureStorage: Remember me data has expired, removing...');
        await this.clearRememberMeData();
        return null;
      }

      // Check if data is too old (additional safety check)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (now - authData.timestamp > maxAge) {
        console.log('SecureStorage: Remember me data is too old, removing...');
        await this.clearRememberMeData();
        return null;
      }

      console.log('SecureStorage: Valid remember me data found');
      return authData;
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve remember me data:', error);
      // Clear corrupted data
      await this.clearRememberMeData();
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  static async clearRememberMeData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ASYNC_STORAGE_KEYS.REMEMBER_ME,
        ASYNC_STORAGE_KEYS.SESSION_TOKEN,
        ASYNC_STORAGE_KEYS.USER_EMAIL,
      ]);
      console.log('SecureStorage: Remember me data cleared successfully');
    } catch (error) {
      console.error('SecureStorage: Failed to clear remember me data:', error);
    }
  }

  /**
   * Check if there's valid stored authentication data
   */
  static async hasValidRememberMeData(): Promise<boolean> {
    const data = await this.getRememberMeData();
    return data !== null;
  }

  /**
   * Store user preferences
   */
  static async storeUserPreference(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`@mitugym_pref_${key}`, value);
    } catch (error) {
      console.error('SecureStorage: Failed to store user preference:', error);
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreference(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`@mitugym_pref_${key}`);
    } catch (error) {
      console.error('SecureStorage: Failed to get user preference:', error);
      return null;
    }
  }

  /**
   * Update the expiry time for existing remember me data
   */
  static async refreshRememberMeData(): Promise<void> {
    try {
      const existingData = await this.getRememberMeData();
      if (existingData) {
        const now = Date.now();
        const updatedData: StoredAuthData = {
          ...existingData,
          timestamp: now,
          expiresAt: now + this.REMEMBER_ME_DURATION,
        };

        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REMEMBER_ME, JSON.stringify(updatedData));
        console.log('SecureStorage: Remember me data refreshed');
      }
    } catch (error) {
      console.error('SecureStorage: Failed to refresh remember me data:', error);
    }
  }

  // ==================== Biometric Authentication Methods (Per-User) ====================

  /**
   * Generate user-specific key for secure storage
   */
  private static getUserKey(userId: string, suffix: string): string {
    return `${suffix}_${userId}`;
  }

  /**
   * Store biometric credentials securely for a specific user
   * Uses expo-secure-store for encrypted storage
   */
  static async storeBiometricCredentials(userId: string, email: string, password: string): Promise<void> {
    try {
      if (!userId || !email || !password) {
        throw new Error('Invalid userId, email or password provided');
      }

      // Store email and password per user in SecureStore
      const emailKey = this.getUserKey(userId, 'biometric_email');
      const passwordKey = this.getUserKey(userId, 'biometric_password');

      await SecureStore.setItemAsync(emailKey, email.toLowerCase().trim());
      await SecureStore.setItemAsync(passwordKey, password);

      console.log('SecureStorage: Biometric credentials stored successfully for user:', userId);
    } catch (error) {
      console.error('SecureStorage: Failed to store biometric credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored biometric credentials for a specific user
   * Returns null if no credentials are stored
   */
  static async getBiometricCredentials(userId: string): Promise<{ email: string; password: string } | null> {
    try {
      if (!userId) {
        return null;
      }

      const emailKey = this.getUserKey(userId, 'biometric_email');
      const passwordKey = this.getUserKey(userId, 'biometric_password');

      const email = await SecureStore.getItemAsync(emailKey);
      const password = await SecureStore.getItemAsync(passwordKey);

      if (!email || !password) {
        console.log('SecureStorage: No biometric credentials found for user:', userId);
        return null;
      }

      console.log('SecureStorage: Biometric credentials retrieved successfully for user:', userId);
      return { email, password };
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve biometric credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored biometric credentials for a specific user
   */
  static async clearBiometricCredentials(userId: string): Promise<void> {
    try {
      if (!userId) {
        return;
      }

      const emailKey = this.getUserKey(userId, 'biometric_email');
      const passwordKey = this.getUserKey(userId, 'biometric_password');

      await SecureStore.deleteItemAsync(emailKey);
      await SecureStore.deleteItemAsync(passwordKey);
      console.log('SecureStorage: Biometric credentials cleared successfully for user:', userId);
    } catch (error) {
      console.error('SecureStorage: Failed to clear biometric credentials:', error);
    }
  }

  /**
   * Check if biometric credentials are stored for a specific user
   */
  static async hasBiometricCredentials(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        return false;
      }

      const emailKey = this.getUserKey(userId, 'biometric_email');
      const passwordKey = this.getUserKey(userId, 'biometric_password');

      const email = await SecureStore.getItemAsync(emailKey);
      const password = await SecureStore.getItemAsync(passwordKey);
      return email !== null && password !== null;
    } catch (error) {
      console.error('SecureStorage: Failed to check biometric credentials:', error);
      return false;
    }
  }

  /**
   * Set biometric authentication enabled status for a specific user
   */
  static async setBiometricEnabled(userId: string, enabled: boolean): Promise<void> {
    try {
      if (!userId) {
        throw new Error('Invalid userId provided');
      }

      const key = this.getUserKey(userId, 'biometric_enabled');
      await SecureStore.setItemAsync(key, enabled.toString());
      console.log('SecureStorage: Biometric enabled status set to:', enabled, 'for user:', userId);
    } catch (error) {
      console.error('SecureStorage: Failed to set biometric enabled status:', error);
      throw error;
    }
  }

  /**
   * Check if biometric authentication is enabled for a specific user
   */
  static async isBiometricEnabled(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        return false;
      }

      const key = this.getUserKey(userId, 'biometric_enabled');
      const enabled = await SecureStore.getItemAsync(key);
      return enabled === 'true';
    } catch (error) {
      console.error('SecureStorage: Failed to check biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Store the last userId that used biometrics (for UX convenience)
   */
  static async setLastBiometricUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('biometric_last_user', userId);
    } catch (error) {
      console.error('SecureStorage: Failed to set last biometric user:', error);
    }
  }

  /**
   * Get the last userId that used biometrics
   */
  static async getLastBiometricUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('biometric_last_user');
    } catch (error) {
      console.error('SecureStorage: Failed to get last biometric user:', error);
      return null;
    }
  }

  /**
   * Set the last biometric authentication failure timestamp for a specific user
   */
  static async setLastBiometricFailTime(userId: string, timestamp: number): Promise<void> {
    try {
      if (!userId) {
        return;
      }

      const key = this.getUserKey(userId, 'biometric_last_fail');
      await SecureStore.setItemAsync(key, timestamp.toString());
    } catch (error) {
      console.error('SecureStorage: Failed to set last biometric fail time:', error);
    }
  }

  /**
   * Get the last biometric authentication failure timestamp for a specific user
   */
  static async getLastBiometricFailTime(userId: string): Promise<number | null> {
    try {
      if (!userId) {
        return null;
      }

      const key = this.getUserKey(userId, 'biometric_last_fail');
      const timestamp = await SecureStore.getItemAsync(key);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('SecureStorage: Failed to get last biometric fail time:', error);
      return null;
    }
  }

  /**
   * Clear the last biometric authentication failure timestamp for a specific user
   */
  static async clearLastBiometricFailTime(userId: string): Promise<void> {
    try {
      if (!userId) {
        return;
      }

      const key = this.getUserKey(userId, 'biometric_last_fail');
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStorage: Failed to clear last biometric fail time:', error);
    }
  }

  /**
   * Clear all biometric-related data for a specific user (credentials + preferences)
   */
  static async clearAllBiometricData(userId: string): Promise<void> {
    try {
      if (!userId) {
        return;
      }

      await this.clearBiometricCredentials(userId);

      const enabledKey = this.getUserKey(userId, 'biometric_enabled');
      await SecureStore.deleteItemAsync(enabledKey);

      await this.clearLastBiometricFailTime(userId);
      console.log('SecureStorage: All biometric data cleared successfully for user:', userId);
    } catch (error) {
      console.error('SecureStorage: Failed to clear all biometric data:', error);
    }
  }
}
