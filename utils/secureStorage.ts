import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
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

      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(authData));
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
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

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
        STORAGE_KEYS.REMEMBER_ME,
        STORAGE_KEYS.SESSION_TOKEN,
        STORAGE_KEYS.USER_EMAIL,
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

        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(updatedData));
        console.log('SecureStorage: Remember me data refreshed');
      }
    } catch (error) {
      console.error('SecureStorage: Failed to refresh remember me data:', error);
    }
  }
}
